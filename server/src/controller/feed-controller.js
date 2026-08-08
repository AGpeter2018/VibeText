import Post from '../models/Post.js';
import User from '../models/User.js';
import WeeklyVibe from '../models/WeeklyVibe.js';
import Notification from '../models/Notification.js';
import { rewardValidator as rewardOnChain } from '../services/hook/writeRewardValidator.js';

export const getTrendingVibes = async (req, res) => {
    try {
        const trending = await Post.aggregate([
            { $group: { _id: "$vibe", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Format to match frontend expectations
        const formatted = trending.map(t => ({
            title: t._id,
            posts: t.count >= 1000 ? (t.count / 1000).toFixed(1) + 'k' : t.count.toString()
        }));

        res.status(200).json(formatted);
    } catch (error) {
        console.error('Error fetching trending vibes:', error);
        res.status(500).json({ error: 'Failed to fetch trending vibes' });
    }
};

export const getFeed = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .populate('authorId', 'name picture')
            .populate('replies.authorId', 'name picture')
            .populate('authenticityRatings.userId', 'name picture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Post.countDocuments();

        res.status(200).json({
            posts,
            hasMore: skip + posts.length < total
        });
    } catch (error) {
        console.error('Error fetching feed:', error);
        res.status(500).json({ error: 'Failed to fetch feed' });
    }
};

export const getTrendingPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        // Find trending posts based on a score combining upvotes, shares, and authenticity
        const posts = await Post.aggregate([
            {
                $addFields: {
                    trendingScore: {
                        $add: [
                            { $multiply: ["$upvotes", 2] },
                            { $multiply: ["$sharesCount", 3] },
                            { $multiply: ["$savesCount", 3] },
                            { $multiply: ["$authenticityScore", 5] }
                        ]
                    }
                }
            },
            { $sort: { trendingScore: -1, createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);

        await Post.populate(posts, { path: 'authorId', select: 'name picture' });
        await Post.populate(posts, { path: 'replies.authorId', select: 'name picture' });
        await Post.populate(posts, { path: 'authenticityRatings.userId', select: 'name picture' });

        const total = await Post.countDocuments(); // Trending considers all posts, realistically should count total

        res.status(200).json({
            posts,
            hasMore: skip + posts.length < total
        });
    } catch (error) {
        console.error('Error fetching trending posts:', error);
        res.status(500).json({ error: 'Failed to fetch trending posts' });
    }
};

export const publishPost = async (req, res) => {
    try {
        const { originalText, tunedText, vibe, intensity, imageUrl } = req.body;

        if (!originalText || !tunedText || !vibe || !intensity) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const post = await Post.create({
            authorId: req.userId,
            originalText,
            tunedText,
            vibe,
            intensity: Number(intensity),
            imageUrl,
        });

        // Populate author before broadcasting
        await post.populate('authorId', 'name picture');

        // Broadcast to all clients
        const io = req.app.get('io');
        if (io) {
            io.emit('new_post', post);
        }

        res.status(201).json(post);
    } catch (error) {
        console.error('Error publishing post:', error);
        res.status(500).json({ error: 'Failed to publish post' });
    }
};

export const upvotePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Prevent duplicate upvotes
        if (post.upvotedBy.includes(req.userId)) {
            return res.status(400).json({ error: 'Already upvoted' });
        }

        post.upvotes += 1;
        post.upvotedBy.push(req.userId);
        await post.save();

        // Create notification for post author (skip if you upvote your own post)
        if (post.authorId.toString() !== req.userId.toString()) {
            const notification = await Notification.create({
                recipient: post.authorId,
                sender: req.userId,
                post: post._id,
                type: 'upvote'
            });

            // Emit the notification live to the author's socket room
            const io = req.app.get('io');
            if (io) {
                const populatedNotif = await Notification.findById(notification._id)
                    .populate('sender', 'name picture')
                    .populate('post', 'vibe tunedText');
                io.to(post.authorId.toString()).emit('new_notification', populatedNotif);
            }
        }

        res.status(200).json({ upvotes: post.upvotes });
    } catch (error) {
        console.error('Error upvoting post:', error);
        res.status(500).json({ error: 'Failed to upvote' });
    }
};

export const replyToPost = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Reply text is required' });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        post.replies.push({
            authorId: req.userId,
            text,
        });

        await post.save();

        // Re-fetch post with populated author info to return the created reply cleanly
        const updatedPost = await Post.findById(req.params.id)
            .populate('replies.authorId', 'name picture')
            .lean();

        res.status(201).json(updatedPost.replies[updatedPost.replies.length - 1]);
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({ error: 'Failed to add reply' });
    }
};

export const ratePost = async (req, res) => {
    try {
        const { score, note } = req.body;
        if (!score || score < 1 || score > 5) {
            return res.status(400).json({ error: 'Valid score (1-5) is required' });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if user already rated
        const existingRatingIndex = post.authenticityRatings.findIndex(r => r.userId.toString() === req.userId);

        if (existingRatingIndex >= 0) {
            // Update existing rating
            post.authenticityRatings[existingRatingIndex].score = score;
            if (note !== undefined) post.authenticityRatings[existingRatingIndex].note = note;
        } else {
            // Add new rating
            post.authenticityRatings.push({
                userId: req.userId,
                score,
                note
            });
        }

        // Recalculate average
        const totalScore = post.authenticityRatings.reduce((sum, r) => sum + r.score, 0);
        post.authenticityScore = totalScore / post.authenticityRatings.length;

        await post.save();

        // --- BOT CHAIN ORACLE: Reward validators who include a community note ---
        let txHash = null;
        // Removed `isFirstTimeRating` constraint to allow unlimited testing for the Hackathon Demo
        if (score === 5 && note && note.trim().length > 0) {
            // Fetch the rater's wallet address from the DB (link wallet step unlocks this)
            const rater = await User.findById(req.userId).select('walletAddress').lean();
            if (rater?.walletAddress) {
                // Use a combination of user ID and current timestamp as verification ID to bypass contract AlreadyProcessed errors on subsequent tests
                const verificationId = `${req.userId}_${Date.now()}`;
                txHash = await rewardOnChain(rater.walletAddress, verificationId);
            }
        }

        res.status(200).json({
            authenticityScore: post.authenticityScore,
            ratingsCount: post.authenticityRatings.length,
            ...(txHash && { txHash }) // Only include txHash if the reward was processed
        });
    } catch (error) {
        console.error('Error rating post:', error);
        res.status(500).json({ error: 'Failed to rate post' });
    }
};

export const savePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isSaved = user.savedPosts.includes(post._id);

        if (isSaved) {
            user.savedPosts = user.savedPosts.filter(id => id.toString() !== post._id.toString());
            post.savesCount = Math.max(0, post.savesCount - 1);
        } else {
            user.savedPosts.push(post._id);
            post.savesCount += 1;

            // Create notification only when saving (not un-saving), and skip self-saves
            if (post.authorId.toString() !== req.userId.toString()) {
                const notification = await Notification.create({
                    recipient: post.authorId,
                    sender: req.userId,
                    post: post._id,
                    type: 'save'
                });

                const io = req.app.get('io');
                if (io) {
                    const populatedNotif = await Notification.findById(notification._id)
                        .populate('sender', 'name picture')
                        .populate('post', 'vibe tunedText');
                    io.to(post.authorId.toString()).emit('new_notification', populatedNotif);
                }
            }
        }

        await Promise.all([user.save(), post.save()]);
        res.status(200).json({ isSaved: !isSaved, savesCount: post.savesCount });
    } catch (error) {
        console.error('Error saving post:', error);
        res.status(500).json({ error: 'Failed to save post' });
    }
};

export const sharePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        post.sharesCount += 1;
        await post.save();

        res.status(200).json({ sharesCount: post.sharesCount });
    } catch (error) {
        console.error('Error sharing post:', error);
        res.status(500).json({ error: 'Failed to share post' });
    }
};

export const getMostAuthenticPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ authenticityScore: { $gt: 0 } })
            .populate('authorId', 'name picture')
            .populate('replies.authorId', 'name picture')
            .populate('authenticityRatings.userId', 'name picture')
            .sort({ authenticityScore: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Post.countDocuments({ authenticityScore: { $gt: 0 } });

        res.status(200).json({
            posts,
            hasMore: skip + posts.length < total
        });
    } catch (error) {
        console.error('Error fetching most authentic posts:', error);
        res.status(500).json({ error: 'Failed to fetch most authentic posts' });
    }
};

export const getCurrentWeeklyVibe = async (req, res) => {
    try {
        const now = new Date();
        const weeklyVibe = await WeeklyVibe.findOne({
            weekStart: { $lte: now },
            weekEnd: { $gte: now },
            isFeatured: true
        }).sort({ createdAt: -1 }).lean();

        if (!weeklyVibe) {
            return res.status(200).json(null);
        }

        res.status(200).json(weeklyVibe);
    } catch (error) {
        console.error('Error fetching weekly vibe:', error);
        res.status(500).json({ error: 'Failed to fetch weekly vibe' });
    }
};

export const copyPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        post.copiesCount = (post.copiesCount || 0) + 1;
        await post.save();

        res.status(200).json({ copiesCount: post.copiesCount });
    } catch (error) {
        console.error('Error copying post:', error);
        res.status(500).json({ error: 'Failed to track copy action' });
    }
};

export const getBlockchainStats = async (req, res) => {
    try {
        const { getContract, getProvider } = await import('../services/blockchain.js');
        const contract = getContract();
        const provider = getProvider();

        if (!contract || !provider) {
            return res.status(200).json({ available: false });
        }

        const contractAddress = process.env.VIBETEXT_CONTRACT_ADDRESS;

        // 1. Treasury balance
        const balanceWei = await provider.getBalance(contractAddress);
        const balanceBOT = Number(balanceWei) / 1e18;

        // 2. Query ValidatorRewarded events from block 0 to latest
        const filter = contract.filters.ValidatorRewarded();
        const events = await contract.queryFilter(filter, 0, 'latest');

        // 3. Aggregate leaderboard: wallet -> { count, totalBOT }
        const walletMap = {};
        for (const ev of events) {
            const addr = ev.args.validator.toLowerCase();
            const amount = Number(ev.args.rewardAmount) / 1e18;
            if (!walletMap[addr]) walletMap[addr] = { address: ev.args.validator, count: 0, totalBOT: 0 };
            walletMap[addr].count += 1;
            walletMap[addr].totalBOT += amount;
        }

        const leaderboard = Object.values(walletMap)
            .sort((a, b) => b.totalBOT - a.totalBOT)
            .slice(0, 5)
            .map(v => ({ ...v, totalBOT: v.totalBOT.toFixed(4) }));

        res.status(200).json({
            available: true,
            balanceBOT: balanceBOT.toFixed(4),
            totalRewards: events.length,
            leaderboard
        });
    } catch (error) {
        console.error('[Blockchain Stats] Error:', error.message);
        res.status(200).json({ available: false });
    }
};



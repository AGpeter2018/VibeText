import Post from '../models/Post.js';
import User from '../models/User.js';
import WeeklyVibe from '../models/WeeklyVibe.js';

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
        res.status(200).json({ authenticityScore: post.authenticityScore, ratingsCount: post.authenticityRatings.length });
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


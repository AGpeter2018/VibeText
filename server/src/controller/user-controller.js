import Post from '../models/Post.js';
import User from '../models/User.js';
import Generation from '../models/Generation.js';

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Auto-promote admin emails on the fly
        const adminEmails = [
            'adenijipeter2018@gmail.com',
            'peteradeniji2018@gmail.com',
            'agpeter2018@gmail.com'
        ];
        if (user.email && adminEmails.includes(user.email.toLowerCase().trim()) && user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ error: 'Failed to fetch current user' });
    }
};

export const getUserDashboard = async (req, res) => {
    try {
        const posts = await Post.find({ authorId: req.userId })
            .populate('authorId', 'name picture')
            .sort({ createdAt: -1 })
            .lean();

        const totalVibes = posts.length;
        const totalUpvotes = posts.reduce((sum, post) => sum + (post.upvotes || 0), 0);

        res.status(200).json({
            stats: { totalVibes, totalUpvotes },
            posts
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
};

export const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPosts = await Post.countDocuments();

        const posts = await Post.find({}, 'upvotes');
        const totalUpvotes = posts.reduce((sum, post) => sum + (post.upvotes || 0), 0);

        res.status(200).json({ totalUsers, totalPosts, totalUpvotes });
    } catch (error) {
        console.error('Error fetching system stats:', error);
        res.status(500).json({ error: 'Failed to fetch system stats' });
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.authorId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
};

export const getSavedPosts = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate({
            path: 'savedPosts',
            populate: [
                { path: 'authorId', select: 'name picture' },
                { path: 'replies.authorId', select: 'name picture' }
            ]
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user.savedPosts);
    } catch (error) {
        console.error('Error fetching saved posts:', error);
        res.status(500).json({ error: 'Failed to fetch saved posts' });
    }
};

export const getNorthStarMetric = async (req, res) => {
    try {
        const totalGenerations = await Generation.countDocuments();
        const totalPosts = await Post.countDocuments();

        const postStats = await Post.aggregate([
            {
                $group: {
                    _id: null,
                    totalShares: { $sum: { $ifNull: ["$sharesCount", 0] } },
                    totalSaves: { $sum: { $ifNull: ["$savesCount", 0] } },
                    totalCopies: { $sum: { $ifNull: ["$copiesCount", 0] } },
                    totalUpvotes: { $sum: { $ifNull: ["$upvotes", 0] } }
                }
            }
        ]);

        const stats = postStats[0] || { totalShares: 0, totalSaves: 0, totalCopies: 0, totalUpvotes: 0 };
        const totalActions = totalPosts + stats.totalShares + stats.totalSaves + stats.totalCopies;

        const score = totalGenerations > 0 ? (totalActions / totalGenerations) * 100 : 0;

        res.status(200).json({
            score: Number(score.toFixed(1)),
            totalGenerations,
            totalPosts,
            totalShares: stats.totalShares,
            totalSaves: stats.totalSaves,
            totalCopies: stats.totalCopies,
            totalUpvotes: stats.totalUpvotes
        });
    } catch (error) {
        console.error('Error calculating North Star metric:', error);
        res.status(500).json({ error: 'Failed to calculate North Star metric' });
    }
};


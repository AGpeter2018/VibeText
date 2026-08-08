import User from '../models/User.js';
import Post from '../models/Post.js';
import WeeklyVibe from '../models/WeeklyVibe.js';

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

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }).lean();

        // Also fetch post counts per user
        const userPostCounts = await Post.aggregate([
            { $group: { _id: "$authorId", count: { $sum: 1 } } }
        ]);

        const countMap = {};
        userPostCounts.forEach(upc => {
            countMap[upc._id.toString()] = upc.count;
        });

        const usersWithStats = users.map(u => ({
            ...u,
            postCount: countMap[u._id.toString()] || 0
        }));

        res.status(200).json(usersWithStats);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('authorId', 'name picture email')
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching all posts:', error);
        res.status(500).json({ error: 'Failed to fetch all posts' });
    }
};

export const deleteAnyPost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(200).json({ message: 'Post deleted successfully by admin' });
    } catch (error) {
        console.error('Error deleting post as admin:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
};

export const createWeeklyVibe = async (req, res) => {
    try {
        const { vibeName, description, weekStart, weekEnd, isFeatured } = req.body;

        if (!vibeName || !description || !weekStart || !weekEnd) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // De-feature previous ones if this is set to featured
        if (isFeatured !== false) {
            await WeeklyVibe.updateMany({ isFeatured: true }, { isFeatured: false });
        }

        const weeklyVibe = await WeeklyVibe.create({
            vibeName,
            description,
            weekStart: new Date(weekStart),
            weekEnd: new Date(weekEnd),
            isFeatured: isFeatured !== false
        });

        res.status(201).json(weeklyVibe);
    } catch (error) {
        console.error('Error creating weekly vibe:', error);
        res.status(500).json({ error: 'Failed to create weekly vibe' });
    }
};


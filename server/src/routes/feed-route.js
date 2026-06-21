import express from 'express';
import Post from '../models/Post.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// GET /api/feed — public, returns all posts sorted by newest first
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching feed:', error);
        res.status(500).json({ error: 'Failed to fetch feed' });
    }
});

// POST /api/feed/publish — requires auth
router.post('/publish', requireAuth, async (req, res) => {
    try {
        const { originalText, tunedText, vibe, intensity } = req.body;

        if (!originalText || !tunedText || !vibe || !intensity) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const post = await Post.create({
            authorId: req.userId,
            originalText,
            tunedText,
            vibe,
            intensity: Number(intensity),
        });

        res.status(201).json(post);
    } catch (error) {
        console.error('Error publishing post:', error);
        res.status(500).json({ error: 'Failed to publish post' });
    }
});

// POST /api/feed/upvote/:id — requires auth
router.post('/upvote/:id', requireAuth, async (req, res) => {
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
});

export default router;

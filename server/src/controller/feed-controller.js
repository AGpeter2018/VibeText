import Post from '../models/Post.js';

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
        const posts = await Post.find()
            .populate('authorId', 'name picture')
            .populate('replies.authorId', 'name picture')
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching feed:', error);
        res.status(500).json({ error: 'Failed to fetch feed' });
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

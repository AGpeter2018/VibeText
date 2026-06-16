import Post from '../models/Post.js';

export const publishPost = async (req, res) => {
    try {
        const { originalText, tunedText, vibe, intensity } = req.body;
        
        if (!originalText || !tunedText || !vibe || !intensity) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newPost = new Post({ originalText, tunedText, vibe, intensity });
        await newPost.save();

        res.status(201).json({ message: 'Post published successfully', post: newPost });
    } catch (error) {
        console.error('Error publishing post:', error);
        res.status(500).json({ error: 'Failed to publish post' });
    }
};

export const getFeed = async (req, res) => {
    try {
        // Sort by newest first, limiting to 50 for the MVP
        const posts = await Post.find().sort({ createdAt: -1 }).limit(50);
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching feed:', error);
        res.status(500).json({ error: 'Failed to fetch feed' });
    }
};

export const upvotePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findByIdAndUpdate(
            id, 
            { $inc: { upvotes: 1 } }, 
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.status(200).json({ message: 'Post upvoted', upvotes: post.upvotes });
    } catch (error) {
        console.error('Error upvoting post:', error);
        res.status(500).json({ error: 'Failed to upvote post' });
    }
};

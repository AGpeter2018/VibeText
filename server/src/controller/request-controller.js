import VibeRequest from '../models/VibeRequest.js';

export const createRequest = async (req, res) => {
    try {
        const { title, description } = req.body;
        
        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const newRequest = await VibeRequest.create({
            authorId: req.userId,
            title,
            description,
            upvotes: [req.userId] // Author automatically upvotes their own request
        });

        res.status(201).json(newRequest);
    } catch (error) {
        console.error('Error creating vibe request:', error);
        res.status(500).json({ error: 'Failed to create vibe request' });
    }
};

export const getRequests = async (req, res) => {
    try {
        // Find requests and sort by number of upvotes (most requested first)
        const requests = await VibeRequest.aggregate([
            {
                $addFields: {
                    upvoteCount: { $size: { $ifNull: ["$upvotes", []] } }
                }
            },
            { $sort: { upvoteCount: -1, createdAt: -1 } },
            { $limit: 50 }
        ]);

        await VibeRequest.populate(requests, { path: 'authorId', select: 'name picture' });

        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching vibe requests:', error);
        res.status(500).json({ error: 'Failed to fetch vibe requests' });
    }
};

export const upvoteRequest = async (req, res) => {
    try {
        const request = await VibeRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ error: 'Vibe request not found' });
        }

        const hasUpvoted = request.upvotes.includes(req.userId);
        
        if (hasUpvoted) {
            // Remove upvote
            request.upvotes = request.upvotes.filter(id => id.toString() !== req.userId);
        } else {
            // Add upvote
            request.upvotes.push(req.userId);
        }

        await request.save();
        res.status(200).json({ upvotes: request.upvotes.length, hasUpvoted: !hasUpvoted });
    } catch (error) {
        console.error('Error upvoting vibe request:', error);
        res.status(500).json({ error: 'Failed to upvote vibe request' });
    }
};

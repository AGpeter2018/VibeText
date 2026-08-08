import express from 'express';
import Notification from '../models/Notification.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// GET /api/notifications — fetch all notifications for the logged-in user
router.get('/', requireAuth, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.userId })
            .populate('sender', 'name picture')
            .populate('post', 'vibe tunedText')
            .sort({ createdAt: -1 })
            .limit(30);

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', requireAuth, async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.userId, read: false }, { read: true });
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

export default router;

import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { 
    getTrendingVibes, 
    getFeed, 
    publishPost, 
    upvotePost, 
    replyToPost 
} from '../controller/feed-controller.js';

const router = express.Router();

// GET /api/feed/trending — public, returns top vibes based on post count
router.get('/trending', getTrendingVibes);

// GET /api/feed — public, returns all posts sorted by newest first
router.get('/', getFeed);

// POST /api/feed/publish — requires auth
router.post('/publish', requireAuth, publishPost);

// POST /api/feed/upvote/:id — requires auth
router.post('/upvote/:id', requireAuth, upvotePost);

// POST /api/feed/reply/:id — requires auth
router.post('/reply/:id', requireAuth, replyToPost);

export default router;

import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { 
    getTrendingVibes, 
    getFeed, 
    publishPost, 
    upvotePost, 
    replyToPost,
    ratePost,
    savePost,
    sharePost,
    getTrendingPosts
} from '../controller/feed-controller.js';

const router = express.Router();

// GET /api/feed/trending — public, returns top vibes based on post count
router.get('/trending', getTrendingVibes);

// GET /api/feed/trending-posts — public, returns top trending posts
router.get('/trending-posts', getTrendingPosts);

// GET /api/feed — public, returns all posts sorted by newest first
router.get('/', getFeed);

// POST /api/feed/publish — requires auth
router.post('/publish', requireAuth, publishPost);

// POST /api/feed/upvote/:id — requires auth
router.post('/upvote/:id', requireAuth, upvotePost);

// POST /api/feed/reply/:id — requires auth
router.post('/reply/:id', requireAuth, replyToPost);

// POST /api/feed/rate/:id — requires auth
router.post('/rate/:id', requireAuth, ratePost);

// POST /api/feed/save/:id — requires auth
router.post('/save/:id', requireAuth, savePost);

// POST /api/feed/share/:id — requires auth
router.post('/share/:id', requireAuth, sharePost);

export default router;

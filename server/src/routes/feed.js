import express from 'express';
import { publishPost, getFeed, upvotePost } from '../controller/feed-controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.post('/publish', requireAuth, publishPost);
router.get('/', getFeed);
router.post('/upvote/:id', requireAuth, upvotePost);

export default router;

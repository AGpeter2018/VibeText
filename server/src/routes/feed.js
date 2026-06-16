import express from 'express';
import { publishPost, getFeed, upvotePost } from '../controller/feed-controller.js';

const router = express.Router();

router.post('/publish', publishPost);
router.get('/', getFeed);
router.post('/upvote/:id', upvotePost);

export default router;

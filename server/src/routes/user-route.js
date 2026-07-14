import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getUserDashboard, getSystemStats, deletePost, getCurrentUser, getSavedPosts, getNorthStarMetric } from '../controller/user-controller.js';

const router = express.Router();

// GET /api/user/me — requires auth
router.get('/me', requireAuth, getCurrentUser);

// GET /api/user/dashboard — requires auth
router.get('/dashboard', requireAuth, getUserDashboard);

// GET /api/user/saved — requires auth
router.get('/saved', requireAuth, getSavedPosts);

// GET /api/user/global-stats — public or auth
router.get('/global-stats', getSystemStats);

// GET /api/user/north-star — public or auth
router.get('/north-star', getNorthStarMetric);

// DELETE /api/user/post/:id — requires auth
router.delete('/post/:id', requireAuth, deletePost);

export default router;

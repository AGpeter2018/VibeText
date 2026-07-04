import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { createRequest, getRequests, upvoteRequest } from '../controller/request-controller.js';

const router = express.Router();

// GET /api/requests — public, returns top requested vibes
router.get('/', getRequests);

// POST /api/requests — requires auth
router.post('/', requireAuth, createRequest);

// POST /api/requests/:id/upvote — requires auth
router.post('/:id/upvote', requireAuth, upvoteRequest);

export default router;

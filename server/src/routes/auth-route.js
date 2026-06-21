import express from 'express';
import { googleAuth } from '../controller/auth-controller.js';

const router = express.Router();

// POST /api/auth/google
router.post('/google', googleAuth);

export default router;

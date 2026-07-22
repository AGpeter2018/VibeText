import express from 'express';
import { googleAuth, register, login, verifyOAuth } from '../controller/auth-controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.post('/google', googleAuth);
router.post('/oauth/verify', verifyOAuth);
router.post('/register', register);
router.post('/login', login);

export default router;

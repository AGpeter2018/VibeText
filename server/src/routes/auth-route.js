import express from 'express';
import { googleAuth, googleTokenAuth, verifyOAuth, sendOtp, verifyOtp, logout } from '../controller/auth-controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.post('/google', googleAuth);
router.post('/google-token', googleTokenAuth);
router.post('/oauth/verify', verifyOAuth);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/logout', logout);

export default router;

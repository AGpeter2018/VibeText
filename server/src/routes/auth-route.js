import express from 'express';
import { googleAuth, verifyOAuth, sendOtp, verifyOtp } from '../controller/auth-controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.post('/google', googleAuth);
router.post('/oauth/verify', verifyOAuth);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

export default router;

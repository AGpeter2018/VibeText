import express from 'express';
import { googleLogin } from '../controller/auth-controller.js';

const router = express.Router();

// Login route
router.post('/google', googleLogin);

export default router;

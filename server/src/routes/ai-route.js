import express from 'express';
import { generateContent } from '../controller/ai-controller.js'

const aiRouter = express.Router();

// Route
aiRouter.post('/tune', generateContent);

export default aiRouter

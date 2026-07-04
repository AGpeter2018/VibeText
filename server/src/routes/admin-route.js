import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { getAllUsers, getAllPosts, deleteAnyPost } from '../controller/admin-controller.js';

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/users', getAllUsers);
router.get('/posts', getAllPosts);
router.delete('/post/:id', deleteAnyPost);

export default router;

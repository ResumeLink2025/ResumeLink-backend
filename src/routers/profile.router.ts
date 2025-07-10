import { Router } from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/profile.controller';
import { authMiddleware } from '../middlewares/middleware.auth';

const router = Router();

router.get('/profile', authMiddleware, getUserProfile);
router.patch('/profile', authMiddleware, updateUserProfile);

export default router;

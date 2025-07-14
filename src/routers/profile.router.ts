import { Router } from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/profile.controller';
import { authMiddleware } from '../middlewares/middleware.auth';

const router = Router();

router.get('/', authMiddleware, getUserProfile);
router.patch('/', authMiddleware, updateUserProfile);

export default router;

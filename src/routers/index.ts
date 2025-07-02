import { Router } from 'express';

import authRouter from './auth.router';
import coffeechatRouter from './coffeechat.router';
import chatRouter from './chat.router';

const router = Router();

router.use('/users', authRouter);
router.use('/coffee-chats', coffeechatRouter);
router.use('/chats', chatRouter);

export default router;

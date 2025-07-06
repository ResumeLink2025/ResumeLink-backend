import { Router } from 'express';
import { Server } from 'socket.io';

import authRouter from './auth.router';
import coffeechatRouter from './coffeechat.router';
import createChatRouter from './chat.router';

// Socket.IO 인스턴스를 받는 팩토리 함수로 변경
export default function createMainRouter(io?: Server): Router {
  const router = Router();

  router.use('/users', authRouter);
  router.use('/coffee-chats', coffeechatRouter);
  router.use('/chats', createChatRouter(io));

  return router;
}

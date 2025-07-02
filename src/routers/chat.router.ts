import express, { Request, Response, Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authMiddleware } from '../middlewares/middleware.auth';
import { validateDto } from '../middlewares/middleware.dto';
import { CreateChatRoomRequestDto } from '../dtos/chat.dto';

const router = Router();
const chatController = new ChatController();

// 모든 채팅 API는 인증 필요
router.use(authMiddleware);

// 채팅방 생성 (커피챗 수락 시에만)
router.post('/rooms', validateDto(CreateChatRoomRequestDto), async (req: Request, res: Response) => {
  await chatController.createChatRoom(req, res);
});

// 사용자의 채팅방 목록 조회
router.get('/rooms', async (req: Request, res: Response) => {
  await chatController.getChatRoomList(req, res);
});

// 특정 채팅방 상세 조회
router.get('/rooms/:chatRoomId', async (req: Request, res: Response) => {
  await chatController.getChatRoomById(req, res);
});

// 채팅방 나가기
router.delete('/rooms/:chatRoomId/participants', async (req: Request, res: Response) => {
  await chatController.leaveChatRoom(req, res);
});

export default router;

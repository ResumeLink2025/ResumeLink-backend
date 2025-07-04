import { Request, Response, Router } from 'express';
import { Server } from 'socket.io';
import { ChatController } from '../controllers/chat.controller';
import { MessageController } from '../controllers/message.controller';
import { authMiddleware } from '../middlewares/middleware.auth';
import { validateDto } from '../middlewares/middleware.dto';
import { uploadMiddleware } from '../middlewares/middleware.upload';
import { CreateChatRoomRequestDto } from '../dtos/chat.dto';
import { 
  SendMessageRequestDto, 
  UpdateMessageRequestDto
} from '../dtos/message.dto';

// Socket.IO 인스턴스를 받는 팩토리 함수로 변경
export default function createChatRouter(io?: Server): Router {
  const router = Router();
  const chatController = new ChatController();
  const messageController = new MessageController(io);

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

  // === 메시지 관련 라우트 ===

  // 텍스트 메시지 전송
  router.post('/rooms/:chatRoomId/messages', validateDto(SendMessageRequestDto), async (req: Request, res: Response) => {
    await messageController.sendMessage(req, res);
  });

  // 파일/이미지 메시지 전송
  router.post('/rooms/:chatRoomId/messages/file', uploadMiddleware.single('file'), async (req: Request, res: Response) => {
    await messageController.sendFileMessage(req, res);
  });

  // 메시지 목록 조회 (페이지네이션 + 일괄 읽음 처리)
  router.get('/rooms/:chatRoomId/messages', async (req: Request, res: Response) => {
    await messageController.getMessages(req, res);
  });

  // 메시지 수정
  router.put('/messages/:messageId', validateDto(UpdateMessageRequestDto), async (req: Request, res: Response) => {
    await messageController.updateMessage(req, res);
  });

  // 메시지 삭제
  router.delete('/messages/:messageId', async (req: Request, res: Response) => {
    await messageController.deleteMessage(req, res);
  });

  // 미읽은 메시지 수 조회
  router.get('/rooms/:chatRoomId/unread-count', async (req: Request, res: Response) => {
    await messageController.getUnreadCount(req, res);
  });

  return router;
}

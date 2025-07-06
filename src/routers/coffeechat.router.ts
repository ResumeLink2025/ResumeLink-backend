import { Router, Request, Response } from 'express';
import coffeechatController from '../controllers/coffeechat.controller';
import { authMiddleware } from '../middlewares/middleware.auth';
import { validateDto } from '../middlewares/middleware.dto';
import { CreateCoffeeChatDto, UpdateCoffeeChatStatusDto, GetCoffeeChatsQueryDto } from '../dtos/coffeechat.dto';

const router = Router();

// 인증 미들웨어 적용
router.use(authMiddleware);

// 커피챗 생성
router.post('/', validateDto(CreateCoffeeChatDto), async (req: Request, res: Response) => {
  await coffeechatController.createCoffeeChat(req, res);
});

// 커피챗 요청 수락/거절
router.patch('/:id/status', validateDto(UpdateCoffeeChatStatusDto), async (req: Request, res: Response) => {
  await coffeechatController.updateStatus(req, res);
});

// 커피챗 목록 통합 조회
router.get('/', validateDto(GetCoffeeChatsQueryDto, 'query'), async (req: Request, res: Response) => {
  await coffeechatController.getCoffeeChats(req, res);
});

// 커피챗 상세 조회
router.get('/:id', async (req: Request, res: Response) => {
  await coffeechatController.getCoffeeChatDetail(req, res);
});

// 커피챗 신청 취소 (삭제)
router.delete('/:id', async (req: Request, res: Response) => {
  await coffeechatController.cancelCoffeeChat(req, res);
});

export default router;

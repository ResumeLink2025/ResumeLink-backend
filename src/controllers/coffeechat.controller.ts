import { Request, Response } from 'express';
import coffeechatService from '../services/coffeechat.service';
import { CoffeeChatStatus } from '@prisma/client';
import { ServiceError } from '../utils/ServiceError';

const coffeechatController = {
  // 1. 커피챗 신청 생성
  createCoffeeChat: async (req: Request, res: Response) => {
    try {
      // 타입 캐스팅
      const userId = req.user?.userId; 
      const { receiverId } = req.body;

      if (!receiverId || !userId) {
        return res.status(400).json({ message: '신청자, 수신자 정보가 필요합니다.' });
      }

      const chat = await coffeechatService.createCoffeeChat(userId, receiverId);
      res.status(201).json({ message: '커피챗 신청이 완료되었습니다.', data: chat });
    } catch (error: any) {
      if (error instanceof ServiceError) {
        return res.status(error.status).json({ message: error.message });
      }
      console.error('커피챗 신청 실패:', error);
      res.status(500).json({ message: '커피챗 신청 중 오류가 발생했습니다.' });
    }
  },

  // 2. 커피챗 상태 변경 (수락/거절)
  updateStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.userId;

      if (!id || !userId) {
        return res.status(400).json({ message: '필수 파라미터가 누락되었습니다.' });
      }
      if (!status || !Object.values(CoffeeChatStatus).includes(status)) {
        return res.status(400).json({ message: '잘못된 상태값입니다.' });
      }

      const result = await coffeechatService.updateStatus(id, status as CoffeeChatStatus, userId);
      res.json({ message: '상태가 성공적으로 변경되었습니다.', data: result });
    } catch (error: any) {
      if (error instanceof ServiceError) {
        return res.status(error.status).json({ message: error.message });
      }
      console.error('상태 변경 실패:', error);
      res.status(500).json({ message: '상태 변경 중 오류가 발생했습니다.' });
    }
  },

  // 3. 커피챗 목록 조회
  getCoffeeChats: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { type } = req.query;

      if (!userId) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
      }

      const list = await coffeechatService.getCoffeeChats(userId, type as string);
      res.json({ message: '목록 조회가 완료되었습니다.', data: list });
    } catch (error: any) {
      if (error instanceof ServiceError) {
        return res.status(error.status).json({ message: error.message });
      }
      console.error('목록 조회 실패:', error);
      res.status(500).json({ message: '목록 조회 중 오류가 발생했습니다.' });
    }
  },

  // 4. 커피챗 상세 조회
  getCoffeeChatDetail: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!id || !userId) {
        return res.status(400).json({ message: '필수 파라미터가 누락되었습니다.' });
      }

      const detail = await coffeechatService.getCoffeeChatDetail(id, userId);
      res.json({ message: '상세 정보 조회가 완료되었습니다.', data: detail });
    } catch (error: any) {
      if (error instanceof ServiceError) {
        return res.status(error.status).json({ message: error.message });
      }
      console.error('상세 정보 조회 실패:', error);
      res.status(500).json({ message: '상세 정보 조회 중 오류가 발생했습니다.' });
    }
  },

};

export default coffeechatController;

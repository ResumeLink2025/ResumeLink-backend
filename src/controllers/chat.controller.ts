import { Request, Response } from 'express';
import { ChatRoomService } from '../services/chat.service';
import { CreateChatRoomRequestDto } from '../dtos/chat.dto';
import { validateDto } from '../middlewares/middleware.dto';
import { ServiceError } from '../utils/ServiceError';

export class ChatController {
  private chatRoomService = new ChatRoomService();

  // 채팅방 생성 (이미 존재하면 기존 방 반환)
  async createChatRoom(req: Request, res: Response) {
    try {
      const currentUserId = req.user?.userId;
      if (!currentUserId) {
        return res.status(401).json({ message: '인증이 필요합니다.' });
      }

      const createChatRoomDto = req.body as CreateChatRoomRequestDto;
      const chatRoom = await this.chatRoomService.createOrGetChatRoom(currentUserId, createChatRoomDto);

      return res.status(200).json({
        success: true,
        message: '채팅방을 조회했습니다.',
        data: chatRoom
      });
    } catch (error: any) {
      if (error instanceof ServiceError) {
        return res.status(error.status).json({ 
          success: false,
          message: error.message 
        });
      }
      console.error('채팅방 생성 오류:', error);
      return res.status(500).json({ 
        success: false,
        message: '채팅방 생성 중 오류가 발생했습니다.' 
      });
    }
  }

  // 사용자의 채팅방 목록 조회
  async getChatRoomList(req: Request, res: Response) {
    try {
      const currentUserId = req.user?.userId;
      if (!currentUserId) {
        return res.status(401).json({ message: '인증이 필요합니다.' });
      }

      const chatRoomList = await this.chatRoomService.getChatRoomList(currentUserId);

      return res.status(200).json({
        success: true,
        message: '채팅방 목록을 조회했습니다.',
        data: chatRoomList.chatRooms,
        total: chatRoomList.total
      });
    } catch (error: any) {
      if (error instanceof ServiceError) {
        return res.status(error.status).json({ 
          success: false,
          message: error.message 
        });
      }
      console.error('채팅방 목록 조회 오류:', error);
      return res.status(500).json({ 
        success: false,
        message: '채팅방 목록 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 특정 채팅방 상세 정보 조회
  async getChatRoomById(req: Request, res: Response) {
    try {
      const currentUserId = req.user?.userId;
      if (!currentUserId) {
        return res.status(401).json({ message: '인증이 필요합니다.' });
      }

      const { chatRoomId } = req.params;
      if (!chatRoomId) {
        return res.status(400).json({ 
          success: false,
          message: '채팅방 ID가 필요합니다.' 
        });
      }

      const chatRoom = await this.chatRoomService.getChatRoomById(chatRoomId, currentUserId);

      return res.status(200).json({
        success: true,
        message: '채팅방 정보를 조회했습니다.',
        data: chatRoom
      });
    } catch (error: any) {
      if (error instanceof ServiceError) {
        return res.status(error.status).json({ 
          success: false,
          message: error.message 
        });
      }
      console.error('채팅방 조회 오류:', error);
      return res.status(500).json({ 
        success: false,
        message: '채팅방 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 채팅방 나가기
  async leaveChatRoom(req: Request, res: Response) {
    try {
      const currentUserId = req.user?.userId;
      if (!currentUserId) {
        return res.status(401).json({ message: '인증이 필요합니다.' });
      }

      const { chatRoomId } = req.params;
      if (!chatRoomId) {
        return res.status(400).json({ 
          success: false,
          message: '채팅방 ID가 필요합니다.' 
        });
      }

      await this.chatRoomService.leaveChatRoom(chatRoomId, currentUserId);

      return res.status(200).json({
        success: true,
        message: '채팅방에서 나갔습니다.'
      });
    } catch (error: any) {
      if (error instanceof ServiceError) {
        return res.status(error.status).json({ 
          success: false,
          message: error.message 
        });
      }
      console.error('채팅방 나가기 오류:', error);
      return res.status(500).json({ 
        success: false,
        message: '채팅방 나가기 중 오류가 발생했습니다.' 
      });
    }
  }

  // 캐시 통계 조회 (개발/디버깅용)
  async getCacheStats(req: Request, res: Response) {
    try {
      const chatRoomService = new ChatRoomService();
      const stats = chatRoomService.getCacheStats();
      
      return res.status(200).json({
        success: true,
        message: '캐시 통계를 조회했습니다.',
        data: stats
      });
    } catch (error: any) {
      console.error('캐시 통계 조회 오류:', error);
      return res.status(500).json({ 
        success: false,
        message: '캐시 통계 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 캐시 수동 정리 (개발/디버깅용)
  async cleanupCache(req: Request, res: Response) {
    try {
      const chatRoomService = new ChatRoomService();
      chatRoomService.cleanupExpiredCaches();
      
      return res.status(200).json({
        success: true,
        message: '캐시가 정리되었습니다.'
      });
    } catch (error: any) {
      console.error('캐시 정리 오류:', error);
      return res.status(500).json({ 
        success: false,
        message: '캐시 정리 중 오류가 발생했습니다.' 
      });
    }
  }
}

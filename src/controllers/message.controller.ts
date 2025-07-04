import { Request, Response } from 'express';
import { MessageService } from '../services/message.service';
import { 
  SendMessageRequestDto, 
  GetMessagesRequestDto,
  UpdateMessageRequestDto
} from '../dtos/message.dto';
import { ServiceError } from '../utils/ServiceError';
import { Server } from 'socket.io';
import { getMessageType } from '../middlewares/middleware.upload';

export class MessageController {
  private messageService = new MessageService();
  private io?: Server;

  constructor(io?: Server) {
    this.io = io;
  }

  // 메시지 전송
  async sendMessage(req: Request, res: Response) {
    try {
      const currentUserId = req.user?.userId;
      if (!currentUserId) {
        return res.status(401).json({ 
          success: false,
          message: '인증이 필요합니다.' 
        });
      }

      const { chatRoomId } = req.params;
      if (!chatRoomId) {
        return res.status(400).json({ 
          success: false,
          message: '채팅방 ID가 필요합니다.' 
        });
      }

      const sendMessageDto = req.body as SendMessageRequestDto;
      const message = await this.messageService.sendMessage(chatRoomId, currentUserId, sendMessageDto);

      return res.status(201).json({
        success: true,
        message: '메시지가 전송되었습니다.',
        data: message
      });
    } catch (error: any) {
      if (error instanceof ServiceError) {
        return res.status(error.status).json({ 
          success: false,
          message: error.message 
        });
      }
      console.error('메시지 전송 오류:', error);
      return res.status(500).json({ 
        success: false,
        message: '메시지 전송 중 오류가 발생했습니다.' 
      });
    }
  }

  // 파일 업로드와 함께 메시지 전송
  async sendFileMessage(req: Request, res: Response) {
    try {
      const currentUserId = req.user?.userId;
      if (!currentUserId) {
        return res.status(401).json({ 
          success: false,
          message: '인증이 필요합니다.' 
        });
      }

      const { chatRoomId } = req.params;
      if (!chatRoomId) {
        return res.status(400).json({ 
          success: false,
          message: '채팅방 ID가 필요합니다.' 
        });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: '파일이 필요합니다.'
        });
      }

      // 업로드된 파일 정보로 메시지 DTO 생성
      const sendMessageDto: SendMessageRequestDto = {
        text: req.body.text || '', // 선택적 텍스트 (파일과 함께 보낼 수 있음)
        fileUrl: `/uploads/chat/${file.filename}`,
        fileName: file.originalname,
        fileSize: file.size,
        messageType: getMessageType(file.mimetype) as any
      };

      const message = await this.messageService.sendMessage(chatRoomId, currentUserId, sendMessageDto);

      return res.status(201).json({
        success: true,
        message: '파일 메시지가 전송되었습니다.',
        data: message
      });
    } catch (error: any) {
      if (error instanceof ServiceError) {
        return res.status(error.status).json({ 
          success: false,
          message: error.message 
        });
      }
      console.error('파일 메시지 전송 오류:', error);
      return res.status(500).json({ 
        success: false,
        message: '파일 메시지 전송 중 오류가 발생했습니다.' 
      });
    }
  }

  // 메시지 목록 조회 (단순 데이터 반환만)
  async getMessages(req: Request, res: Response) {
    try {
      const currentUserId = req.user?.userId;
      if (!currentUserId) {
        return res.status(401).json({ 
          success: false,
          message: '인증이 필요합니다.' 
        });
      }

      const { chatRoomId } = req.params;
      if (!chatRoomId) {
        return res.status(400).json({ 
          success: false,
          message: '채팅방 ID가 필요합니다.' 
        });
      }

      const query: GetMessagesRequestDto = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        cursor: req.query.cursor as string,
        direction: (req.query.direction as 'before' | 'after') || 'before'
      };

      // 단순히 메시지만 조회 (읽음 처리 제거)
      const messageList = await this.messageService.getMessages(chatRoomId, currentUserId, query);

      return res.status(200).json({
        success: true,
        message: '메시지 목록을 조회했습니다.',
        data: messageList
      });
    } catch (error: any) {
      if (error instanceof ServiceError) {
        return res.status(error.status).json({ 
          success: false,
          message: error.message 
        });
      }
      console.error('메시지 목록 조회 오류:', error);
      return res.status(500).json({ 
        success: false,
        message: '메시지 목록 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 메시지 수정
  async updateMessage(req: Request, res: Response) {
    try {
      const currentUserId = req.user?.userId;
      if (!currentUserId) {
        return res.status(401).json({ 
          success: false,
          message: '인증이 필요합니다.' 
        });
      }

      const { messageId } = req.params;
      if (!messageId) {
        return res.status(400).json({ 
          success: false,
          message: '메시지 ID가 필요합니다.' 
        });
      }

      const updateMessageDto = req.body as UpdateMessageRequestDto;
      const updatedMessage = await this.messageService.updateMessage(messageId, currentUserId, updateMessageDto);

      return res.status(200).json({
        success: true,
        message: '메시지가 수정되었습니다.',
        data: updatedMessage
      });
    } catch (error: any) {
      if (error instanceof ServiceError) {
        return res.status(error.status).json({ 
          success: false,
          message: error.message 
        });
      }
      console.error('메시지 수정 오류:', error);
      return res.status(500).json({ 
        success: false,
        message: '메시지 수정 중 오류가 발생했습니다.' 
      });
    }
  }

  // 메시지 삭제
  async deleteMessage(req: Request, res: Response) {
    try {
      const currentUserId = req.user?.userId;
      if (!currentUserId) {
        return res.status(401).json({ 
          success: false,
          message: '인증이 필요합니다.' 
        });
      }

      const { messageId } = req.params;
      if (!messageId) {
        return res.status(400).json({ 
          success: false,
          message: '메시지 ID가 필요합니다.' 
        });
      }

      await this.messageService.deleteMessage(messageId, currentUserId);

      return res.status(200).json({
        success: true,
        message: '메시지가 삭제되었습니다.'
      });
    } catch (error: any) {
      if (error instanceof ServiceError) {
        return res.status(error.status).json({ 
          success: false,
          message: error.message 
        });
      }
      console.error('메시지 삭제 오류:', error);
      return res.status(500).json({ 
        success: false,
        message: '메시지 삭제 중 오류가 발생했습니다.' 
      });
    }
  }

  // 미읽은 메시지 수 조회
  async getUnreadCount(req: Request, res: Response) {
    try {
      const currentUserId = req.user?.userId;
      if (!currentUserId) {
        return res.status(401).json({ 
          success: false,
          message: '인증이 필요합니다.' 
        });
      }

      const { chatRoomId } = req.params;
      if (!chatRoomId) {
        return res.status(400).json({ 
          success: false,
          message: '채팅방 ID가 필요합니다.' 
        });
      }

      const unreadCount = await this.messageService.getUnreadMessageCount(chatRoomId, currentUserId);

      return res.status(200).json({
        success: true,
        message: '미읽은 메시지 수를 조회했습니다.',
        data: { unreadCount }
      });
    } catch (error: any) {
      if (error instanceof ServiceError) {
        return res.status(error.status).json({ 
          success: false,
          message: error.message 
        });
      }
      console.error('미읽은 메시지 수 조회 오류:', error);
      return res.status(500).json({ 
        success: false,
        message: '미읽은 메시지 수 조회 중 오류가 발생했습니다.' 
      });
    }
  }
}

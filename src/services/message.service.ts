import { MessageRepository, MessageWithSender } from '../repositories/message.repository';
import { ChatRepository } from '../repositories/chat.repository';
import { 
  SendMessageRequestDto, 
  MessageResponseDto, 
  GetMessagesRequestDto,
  MessageListResponseDto,
  UpdateMessageRequestDto,
  MessageType
} from '../dtos/message.dto';
import { ServiceError } from '../utils/ServiceError';
import { plainToInstance } from 'class-transformer';

// 메시지 관련 에러 정의
export const MessageErrors = {
  MESSAGE_NOT_FOUND: () => new ServiceError(404, '메시지를 찾을 수 없습니다.'),
  ACCESS_DENIED: () => new ServiceError(403, '메시지에 접근할 권한이 없습니다.'),
  CANNOT_EDIT_MESSAGE: () => new ServiceError(400, '메시지를 수정할 수 없습니다.'),
  CANNOT_DELETE_MESSAGE: () => new ServiceError(400, '메시지를 삭제할 수 없습니다.'),
  INVALID_MESSAGE_CONTENT: () => new ServiceError(400, '메시지 내용이 올바르지 않습니다.'),
  CHAT_ROOM_NOT_ACCESSIBLE: () => new ServiceError(403, '채팅방에 접근할 수 없습니다.'),
  MESSAGE_SEND_FAILED: () => new ServiceError(500, '메시지 전송에 실패했습니다.')
};

export class MessageService {
  constructor(
    private readonly messageRepository = new MessageRepository(),
    private readonly chatRepository = new ChatRepository()
  ) {}

  // 메시지 전송
  async sendMessage(
    chatRoomId: string, 
    senderId: string, 
    data: SendMessageRequestDto
  ): Promise<MessageResponseDto> {
    // 1. 채팅방 참여자 권한 확인
    const isParticipant = await this.chatRepository.isChatRoomParticipant(chatRoomId, senderId);
    if (!isParticipant) {
      throw MessageErrors.CHAT_ROOM_NOT_ACCESSIBLE();
    }

    // 2. 메시지 내용 검증
    if (!data.text && !data.fileUrl) {
      throw MessageErrors.INVALID_MESSAGE_CONTENT();
    }

    try {
      // 3. 메시지 생성
      const message = await this.messageRepository.createMessage({
        chatRoomId,
        senderId,
        text: data.text,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        messageType: data.messageType
      });

      return this.transformToMessageResponse(message);
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      throw MessageErrors.MESSAGE_SEND_FAILED();
    }
  }

  // 메시지 목록 조회
  async getMessages(
    chatRoomId: string,
    userId: string,
    query: GetMessagesRequestDto
  ): Promise<MessageListResponseDto> {
    // 1. 채팅방 참여자 권한 확인
    const isParticipant = await this.chatRepository.isChatRoomParticipant(chatRoomId, userId);
    if (!isParticipant) {
      throw MessageErrors.CHAT_ROOM_NOT_ACCESSIBLE();
    }

    let cursor = query.cursor;

    // 2. "첫 번째 미읽은 메시지부터" 옵션 처리
    if (query.fromFirstUnread && !cursor) {
      const firstUnreadMessageId = await this.messageRepository.getFirstUnreadMessageId(chatRoomId, userId);
      if (firstUnreadMessageId) {
        cursor = firstUnreadMessageId;
        // 첫 번째 미읽은 메시지를 포함하여 조회하기 위해 direction을 'after'로 설정
        query.direction = 'after';
      }
    }

    // 3. 메시지 목록 조회
    const messages = await this.messageRepository.findMessagesByChatRoomId(chatRoomId, {
      limit: query.limit || 20,
      cursor,
      direction: query.direction || 'before'
    });

    // 4. 총 메시지 수 조회
    const total = await this.messageRepository.getMessageCount(chatRoomId);

    // 5. 응답 데이터 구성
    const transformedMessages = messages.map(message => 
      this.transformToMessageResponse(message)
    );

    // 6. 다음 커서 설정
    const hasMore = messages.length === (query.limit || 20);
    const nextCursor = hasMore && messages.length > 0 
      ? messages[messages.length - 1].id 
      : undefined;

    return {
      messages: transformedMessages,
      hasMore,
      nextCursor,
      total
    };
  }

  // 메시지 수정
  async updateMessage(
    messageId: string,
    userId: string,
    data: UpdateMessageRequestDto
  ): Promise<MessageResponseDto> {
    // 1. 메시지 존재 확인
    const existingMessage = await this.messageRepository.findMessageById(messageId);
    if (!existingMessage) {
      throw MessageErrors.MESSAGE_NOT_FOUND();
    }

    // 2. 발신자 권한 확인
    if (existingMessage.senderId !== userId) {
      throw MessageErrors.ACCESS_DENIED();
    }

    // 3. 수정 가능 여부 확인 (텍스트 메시지만 수정 가능)
    if (existingMessage.messageType !== 'TEXT' || existingMessage.isDeleted) {
      throw MessageErrors.CANNOT_EDIT_MESSAGE();
    }

    // 4. 메시지 수정
    const updatedMessage = await this.messageRepository.updateMessage(messageId, data.text);
    
    return this.transformToMessageResponse(updatedMessage);
  }

  // 메시지 삭제
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    // 1. 메시지 존재 확인
    const existingMessage = await this.messageRepository.findMessageById(messageId);
    if (!existingMessage) {
      throw MessageErrors.MESSAGE_NOT_FOUND();
    }

    // 2. 발신자 권한 확인
    if (existingMessage.senderId !== userId) {
      throw MessageErrors.ACCESS_DENIED();
    }

    // 3. 삭제 가능 여부 확인
    if (existingMessage.isDeleted) {
      throw MessageErrors.CANNOT_DELETE_MESSAGE();
    }

    // 4. 메시지 삭제 (소프트 삭제)
    await this.messageRepository.deleteMessage(messageId);
  }

  // 읽음 상태 업데이트
  async markAsRead(chatRoomId: string, userId: string, messageId: string): Promise<void> {
    // 1. 채팅방 참여자 권한 확인
    const isParticipant = await this.chatRepository.isChatRoomParticipant(chatRoomId, userId);
    if (!isParticipant) {
      throw MessageErrors.CHAT_ROOM_NOT_ACCESSIBLE();
    }

    // 2. 메시지 존재 확인
    const message = await this.messageRepository.findMessageById(messageId);
    if (!message || message.chatRoomId !== chatRoomId) {
      throw MessageErrors.MESSAGE_NOT_FOUND();
    }

    // 3. 읽음 상태 업데이트
    await this.messageRepository.markAsRead(chatRoomId, userId, messageId);
  }

  // 미읽은 메시지 수 조회
  async getUnreadMessageCount(chatRoomId: string, userId: string): Promise<number> {
    // 1. 채팅방 참여자 권한 확인
    const isParticipant = await this.chatRepository.isChatRoomParticipant(chatRoomId, userId);
    if (!isParticipant) {
      throw MessageErrors.CHAT_ROOM_NOT_ACCESSIBLE();
    }

    // 2. 미읽은 메시지 수 계산
    return await this.messageRepository.getUnreadMessageCount(chatRoomId, userId);
  }

  // 모든 미읽은 메시지 일괄 읽음 처리 (채팅방 입장 시만 사용)
  async markAllUnreadMessagesAsRead(
    chatRoomId: string, 
    userId: string
  ): Promise<{ readCount: number; lastReadMessageId?: string }> {
    // 1. 채팅방 참여자 권한 확인
    const isParticipant = await this.chatRepository.isChatRoomParticipant(chatRoomId, userId);
    if (!isParticipant) {
      throw MessageErrors.CHAT_ROOM_NOT_ACCESSIBLE();
    }

    // 2. 미읽은 메시지들을 일괄로 읽음 처리
    const result = await this.messageRepository.markAllUnreadMessagesAsRead(chatRoomId, userId);
    
    console.log(`[MessageService] 채팅방 입장 시 일괄 읽음 처리: 사용자 ${userId}, 채팅방 ${chatRoomId}, 읽은 수: ${result.readCount}`);
    
    return result;
  }

  // 데이터 변환 헬퍼 메서드
  private transformToMessageResponse(message: MessageWithSender): MessageResponseDto {
    return {
      id: message.id,
      chatRoomId: message.chatRoomId,
      senderId: message.senderId,
      text: message.text || undefined,
      fileUrl: message.fileUrl || undefined,
      fileName: message.fileName || undefined,
      fileSize: message.fileSize || undefined,
      messageType: message.messageType as MessageType,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
      isEdited: message.isEdited,
      isDeleted: message.isDeleted,
      sender: {
        id: message.sender.id,
        email: message.sender.email,
        profile: message.sender.profile ? {
          nickname: message.sender.profile.nickname,
          imageUrl: message.sender.profile.imageUrl || undefined
        } : undefined
      }
    };
  }
}

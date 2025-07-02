import { ChatRepository } from '../repositories/chat.repository';
import { 
  CreateChatRoomRequestDto, 
  ChatRoomResponseDto, 
  ChatRoomListResponseDto,
  ChatParticipantResponseDto,
  UserInfoDto,
  UserProfileDto
} from '../dtos/chat.dto';
import { ChatRoomAccessError, ChatRoomNotFoundError } from '../types/chat.types';
import { plainToInstance } from 'class-transformer';

export class ChatRoomService {
  
  constructor(private readonly chatRepository = new ChatRepository()) {}

  // 1:1 채팅방 생성 또는 기존 방 반환
  async createOrGetChatRoom(currentUserId: string, input: CreateChatRoomRequestDto): Promise<ChatRoomResponseDto> {
    const { participantId } = input;

    // 본인과의 채팅 방지
    if (currentUserId === participantId) {
      throw new ChatRoomAccessError('자기 자신과는 채팅할 수 없습니다.');
    }

    // 기존 채팅방 조회
    const existingChatRoom = await this.chatRepository.findChatRoomByParticipants(
      currentUserId, 
      participantId
    );

    if (existingChatRoom) {
      return this.transformToChatRoomResponse(existingChatRoom);
    }

    // 새 채팅방 생성
    const newChatRoom = await this.chatRepository.createChatRoom(currentUserId, participantId);
    return this.transformToChatRoomResponse(newChatRoom);
  }

  // 사용자의 채팅방 목록 조회
  async getChatRoomList(userId: string): Promise<ChatRoomListResponseDto> {
    const chatRooms = await this.chatRepository.findChatRoomsByUserId(userId);
    
    const transformedChatRooms = chatRooms.map(room => this.transformToChatRoomResponse(room));
    
    return plainToInstance(ChatRoomListResponseDto, {
      chatRooms: transformedChatRooms,
      total: transformedChatRooms.length
    });
  }

  // 특정 채팅방 상세 조회
  async getChatRoomById(chatRoomId: string, userId: string): Promise<ChatRoomResponseDto> {
    // 참여자 권한 확인
    const isParticipant = await this.chatRepository.isChatRoomParticipant(chatRoomId, userId);
    if (!isParticipant) {
      throw new ChatRoomAccessError();
    }

    const chatRoom = await this.chatRepository.findChatRoomById(chatRoomId);
    if (!chatRoom) {
      throw new ChatRoomNotFoundError();
    }

    return this.transformToChatRoomResponse(chatRoom);
  }

  // 채팅방 나가기 (향후 구현)
  async leaveChatRoom(chatRoomId: string, userId: string): Promise<void> {
    // 참여자 권한 확인
    const isParticipant = await this.chatRepository.isChatRoomParticipant(chatRoomId, userId);
    if (!isParticipant) {
      throw new ChatRoomAccessError();
    }

    // TODO: leftAt 필드 업데이트 로직 구현
    await this.chatRepository.leaveChatRoom(chatRoomId, userId);
  }

  // 데이터 변환 헬퍼 메서드
  private transformToChatRoomResponse(chatRoom: any): ChatRoomResponseDto {
    const participants = chatRoom.participants?.map((participant: any) => {
      const userInfo: UserInfoDto = {
        id: participant.user.id,
        email: participant.user.email,
        profile: participant.user.profile ? {
          nickname: participant.user.profile.nickname,
          imageUrl: participant.user.profile.imageUrl
        } : undefined
      };

      return plainToInstance(ChatParticipantResponseDto, {
        id: participant.id,
        userId: participant.userId,
        joinedAt: participant.joinedAt || participant.createdAt, // 임시로 createdAt 사용
        leftAt: participant.leftAt,
        user: userInfo
      });
    }) || [];

    const lastMessage = chatRoom.messages?.[0] ? {
      id: chatRoom.messages[0].id,
      text: chatRoom.messages[0].text,
      messageType: chatRoom.messages[0].messageType || 'TEXT',
      createdAt: chatRoom.messages[0].createdAt.toISOString(),
      senderId: chatRoom.messages[0].senderId
    } : undefined;

    return plainToInstance(ChatRoomResponseDto, {
      id: chatRoom.id,
      coffeeChatId: chatRoom.coffeeChatId,
      createdAt: chatRoom.createdAt.toISOString(),
      participants,
      lastMessage,
      unreadCount: 0 // 향후 구현
    });
  }
}
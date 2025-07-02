import { ChatRepository } from '../repositories/chat.repository';
import { 
  CreateChatRoomRequestDto, 
  ChatRoomResponseDto, 
  ChatRoomListResponseDto,
  ChatParticipantResponseDto,
  UserInfoDto,
  UserProfileDto
} from '../dtos/chat.dto';
import { IChatRoomService, ChatErrors } from '../types/chat.types';
import { plainToInstance } from 'class-transformer';
import prisma from '../lib/prisma';

export class ChatRoomService implements IChatRoomService {
  
  constructor(private readonly chatRepository = new ChatRepository()) {}

  // 커피챗 수락 시 채팅방 생성 또는 기존 방 반환
  async createOrGetChatRoom(currentUserId: string, input: CreateChatRoomRequestDto): Promise<ChatRoomResponseDto> {
    const { participantId } = input;

    // 본인과의 채팅 방지
    if (currentUserId === participantId) {
      throw ChatErrors.SELF_CHAT_NOT_ALLOWED();
    }

    // 커피챗 존재 확인 (수락된 상태여야 함)
    const coffeeChat = await this.findAcceptedCoffeeChat(currentUserId, participantId);
    if (!coffeeChat) {
      throw ChatErrors.NO_ACCEPTED_COFFEECHAT('수락된 커피챗이 없습니다.');
    }

    // 기존 채팅방 조회
    const existingChatRoom = await this.chatRepository.findChatRoomByCoffeeChatId(coffeeChat.id);

    if (existingChatRoom) {
      return this.transformToChatRoomResponse(existingChatRoom);
    }

    // 새 채팅방 생성
    const newChatRoom = await this.chatRepository.createChatRoomFromCoffeeChat(
      coffeeChat.id, 
      currentUserId, 
      participantId
    );
    return this.transformToChatRoomResponse(newChatRoom);
  }

  // 수락된 커피챗 찾기
  private async findAcceptedCoffeeChat(userId1: string, userId2: string) {
    return prisma.coffeeChat.findFirst({
      where: {
        status: 'accepted',
        OR: [
          { requesterId: userId1, receiverId: userId2 },
          { requesterId: userId2, receiverId: userId1 }
        ]
      }
    });
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
      throw ChatErrors.ACCESS_DENIED();
    }

    const chatRoom = await this.chatRepository.findChatRoomById(chatRoomId);
    if (!chatRoom) {
      throw ChatErrors.ROOM_NOT_FOUND();
    }

    return this.transformToChatRoomResponse(chatRoom);
  }

  // 채팅방 나가기 (개선된 로직)
  async leaveChatRoom(chatRoomId: string, userId: string): Promise<void> {
    // 참여자 권한 확인
    const isParticipant = await this.chatRepository.isChatRoomParticipant(chatRoomId, userId);
    if (!isParticipant) {
      throw ChatErrors.ACCESS_DENIED();
    }

    // 채팅방 나가기 실행
    const result = await this.chatRepository.leaveChatRoom(chatRoomId, userId);
    
    // 로그 기록 (선택사항)
    if (result.shouldArchiveRoom) {
      console.log(`채팅방 ${chatRoomId}가 아카이브되었습니다. 모든 참여자가 나갔습니다.`);
    }
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
        joinedAt: participant.joinedAt || participant.createdAt,
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
      unreadCount: 0
    });
  }
}
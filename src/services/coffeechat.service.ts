import coffeechatRepository from '../repositories/coffeechat.repository';
// import userRepository from '../repositories/user.repository'; // 비활성화 유저 검증용 (필요시)
import { CoffeeChatStatus } from '@prisma/client';
import { ServiceError } from '../utils/ServiceError';
import { CoffeeChatWithUsers } from '../dtos/coffeechat.dto';
import { CoffeeChatErrors } from '../types/coffeechat.types';

const coffeechatService = {
  /**
   * 커피챗 정보 조회 헬퍼 메서드
   * 
   * @param coffeeChatId - 커피챗 ID
   * @returns 커피챗 정보
   * @throws {ServiceError} 커피챗이 존재하지 않는 경우
   */
  async _getChatOrThrow(coffeeChatId: string) {
    const chat = await coffeechatRepository.getCoffeeChatDetail(coffeeChatId);
    if (!chat) {
      throw CoffeeChatErrors.NOT_FOUND();
    }
    return chat;
  },

  /**
   * 커피챗 접근 권한 검증 헬퍼 메서드
   * 
   * @param chat - 커피챗 정보
   * @param userId - 사용자 ID
   * @throws {ServiceError} 접근 권한이 없는 경우
   */
  _validateChatAccess(chat: CoffeeChatWithUsers, userId: string) {
    if (chat.requesterId !== userId && chat.receiverId !== userId) {
      throw CoffeeChatErrors.ACCESS_DENIED();
    }
  },

  /**
   * 커피챗 수신자 권한 검증 헬퍼 메서드
   * 
   * @param chat - 커피챗 정보
   * @param userId - 사용자 ID
   * @throws {ServiceError} 수신자가 아닌 경우
   */
  _validateReceiverAccess(chat: CoffeeChatWithUsers, userId: string) {
    if (chat.receiverId !== userId) {
      throw CoffeeChatErrors.RECEIVER_ONLY();
    }
  },

  /**
   * 커피챗 신청자 권한 검증 헬퍼 메서드
   * 
   * @param chat - 커피챗 정보
   * @param userId - 사용자 ID
   * @throws {ServiceError} 신청자가 아닌 경우
   */
  _validateRequesterAccess(chat: CoffeeChatWithUsers, userId: string) {
    if (chat.requesterId !== userId) {
      throw CoffeeChatErrors.REQUESTER_ONLY();
    }
  },

  /**
   * 커피챗 대기 상태 검증 헬퍼 메서드
   * 
   * @param chat - 커피챗 정보
   * @throws {ServiceError} 대기 상태가 아닌 경우
   */
  _validatePendingStatus(chat: CoffeeChatWithUsers) {
    if (chat.status !== CoffeeChatStatus.pending) {
      throw CoffeeChatErrors.ALREADY_PROCESSED();
    }
  },

  /**
   * 커피챗 취소 가능 상태 검증 헬퍼 메서드
   * 
   * @param chat - 커피챗 정보
   * @throws {ServiceError} 취소할 수 없는 상태인 경우
   */
  _validateCancelable(chat: CoffeeChatWithUsers) {
    if (chat.status !== CoffeeChatStatus.pending) {
      throw new ServiceError(400, '이미 처리된 커피챗은 취소할 수 없습니다.');
    }
  },
  /**
   * 커피챗 신청 생성
   * 
   * @param requesterId - 신청자 ID
   * @param receiverId - 수신자 ID
   * @returns 생성된 커피챗 정보
   * @throws {ServiceError} 본인 신청, 중복 신청 등의 경우 에러 발생
   */
  async createCoffeeChat(requesterId: string, receiverId: string) {
    if (requesterId === receiverId) {
      throw CoffeeChatErrors.SELF_REQUEST_NOT_ALLOWED();
    }

    // (Optional) 비활성화 유저 체크
    // const targetUser = await userRepository.getUserById(receiverId);
    // if (!targetUser || targetUser.status === 'inactive') {
    //   const error: ServiceError = { status: 400, message: '비활성화된 유저에게는 신청할 수 없습니다.' };
    //   throw error;
    // }

    // 중복 대기 커피챗 체크
    const exist = await coffeechatRepository.findPendingBetween(requesterId, receiverId);
    if (exist) {
      throw CoffeeChatErrors.DUPLICATE_REQUEST();
    }

    return coffeechatRepository.createCoffeeChat(requesterId, receiverId);
  },

  /**
   * 커피챗 상태 변경 (수락/거절)
   * 
   * @param coffeeChatId - 커피챗 ID
   * @param status - 변경할 상태 (accepted/rejected)
   * @param userId - 상태를 변경하는 사용자 ID (수신자만 가능)
   * @returns 업데이트된 커피챗 정보 (수락 시 채팅방 정보 포함)
   * @throws {ServiceError} 권한 없음, 이미 처리됨 등의 경우 에러 발생
   */
  async updateStatus(coffeeChatId: string, status: CoffeeChatStatus, userId: string) {
    const chat = await this._getChatOrThrow(coffeeChatId);
    this._validateReceiverAccess(chat, userId);
    this._validatePendingStatus(chat);

    // 상대방이 비활성화 유저인지 체크
    // const targetUser = await userRepository.getUserById(chat.requesterId);
    // if (targetUser?.status === 'inactive') {
    //   throw new ServiceError(400, '비활성화 유저와의 커피챗은 처리할 수 없습니다.');
    // }

    const updatedChat = await coffeechatRepository.updateStatus(coffeeChatId, status);

    // 커피챗 수락 시 자동으로 채팅방 생성 및 정보 반환
    if (status === CoffeeChatStatus.accepted) {
      try {
        // 동적 import로 순환 참조 방지
        const { ChatRoomService } = await import('./chat.service');
        const chatService = new ChatRoomService();
        
        const chatRoom = await chatService.createOrGetChatRoom(userId, { 
          participantId: chat.requesterId 
        });
        
        console.log(`[CoffeeChat] 수락 후 채팅방 자동 생성: ${coffeeChatId} -> 채팅방: ${chatRoom.id}`);
        
        // 채팅방 정보 포함하여 반환
        return {
          ...updatedChat,
          chatRoom: {
            id: chatRoom.id,
            message: '채팅방이 생성되었습니다. 대화를 시작해보세요!'
          }
        };
      } catch (error) {
        console.error('[CoffeeChat] 채팅방 자동 생성 실패:', error);
        // 채팅방 생성 실패해도 커피챗 수락은 유지하고 안내 메시지만 추가
        return {
          ...updatedChat,
          chatRoom: {
            id: null,
            message: '채팅방 생성 중 오류가 발생했습니다. 채팅 목록에서 대화를 시작해보세요.'
          }
        };
      }
    }

    return updatedChat;
  },

  /**
   * 사용자의 커피챗 목록 조회
   * 
   * @param userId - 사용자 ID
   * @param type - 조회 타입 ('requested': 신청한 것, 'received': 받은 것, undefined: 전체)
   * @returns 커피챗 목록
   */
  async getCoffeeChats(userId: string, type?: string) {
    if (type === 'requested') {
      return coffeechatRepository.getRequestedChats(userId);
    } else if (type === 'received') {
      return coffeechatRepository.getReceivedChats(userId);
    } else {
      return coffeechatRepository.getAllChats(userId);
    }
  },

  /**
   * 커피챗 상세 정보 조회
   * 
   * @param coffeeChatId - 커피챗 ID
   * @param userId - 조회하는 사용자 ID
   * @returns 커피챗 상세 정보
   * @throws {ServiceError} 존재하지 않음, 접근 권한 없음 등의 경우 에러 발생
   */
  async getCoffeeChatDetail(coffeeChatId: string, userId: string) {
    const chat = await this._getChatOrThrow(coffeeChatId);
    this._validateChatAccess(chat, userId);
    return chat;
  },

  /**
   * 커피챗 신청 취소(삭제)
   * 
   * @param coffeeChatId - 취소할 커피챗 ID
   * @param userId - 취소하는 사용자 ID (신청자만 가능)
   * @returns 취소된 커피챗 정보
   * @throws {ServiceError} 존재하지 않음, 권한 없음, 이미 처리됨 등의 경우 에러 발생
   */
};

export default coffeechatService;

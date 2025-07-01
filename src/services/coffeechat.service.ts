import coffeechatRepository from '../repositories/coffeechat.repository';
// import userRepository from '../repositories/user.repository'; // 비활성화 유저 검증용 (필요시)
import { CoffeeChatStatus } from '@prisma/client';
import { ServiceError } from '../utils/ServiceError';

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
      throw new ServiceError(404, '해당 커피챗이 존재하지 않습니다.');
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
  _validateChatAccess(chat: any, userId: string) {
    if (chat.requesterId !== userId && chat.receiverId !== userId) {
      throw new ServiceError(403, '해당 커피챗에 접근할 권한이 없습니다.');
    }
  },

  /**
   * 커피챗 수신자 권한 검증 헬퍼 메서드
   * 
   * @param chat - 커피챗 정보
   * @param userId - 사용자 ID
   * @throws {ServiceError} 수신자가 아닌 경우
   */
  _validateReceiverAccess(chat: any, userId: string) {
    if (chat.receiverId !== userId) {
      throw new ServiceError(403, '수락/거절은 받은 사람만 할 수 있습니다.');
    }
  },

  /**
   * 커피챗 신청자 권한 검증 헬퍼 메서드
   * 
   * @param chat - 커피챗 정보
   * @param userId - 사용자 ID
   * @throws {ServiceError} 신청자가 아닌 경우
   */
  _validateRequesterAccess(chat: any, userId: string) {
    if (chat.requesterId !== userId) {
      throw new ServiceError(403, '본인이 신청한 커피챗만 취소할 수 있습니다.');
    }
  },

  /**
   * 커피챗 대기 상태 검증 헬퍼 메서드
   * 
   * @param chat - 커피챗 정보
   * @throws {ServiceError} 대기 상태가 아닌 경우
   */
  _validatePendingStatus(chat: any) {
    if (chat.status !== 'pending') {
      throw new ServiceError(400, '이미 처리된 커피챗입니다.');
    }
  },

  /**
   * 커피챗 취소 가능 상태 검증 헬퍼 메서드
   * 
   * @param chat - 커피챗 정보
   * @throws {ServiceError} 취소할 수 없는 상태인 경우
   */
  _validateCancelable(chat: any) {
    if (chat.status !== 'pending') {
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
      throw new ServiceError(400, '본인에게는 커피챗을 신청할 수 없습니다.');
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
      throw new ServiceError(409, '이미 대기 중인 커피챗이 있습니다.');
    }

    return coffeechatRepository.createCoffeeChat(requesterId, receiverId);
  },

  /**
   * 커피챗 상태 변경 (수락/거절)
   * 
   * @param coffeeChatId - 커피챗 ID
   * @param status - 변경할 상태 (accepted/rejected)
   * @param userId - 상태를 변경하는 사용자 ID (수신자만 가능)
   * @returns 업데이트된 커피챗 정보
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

    return coffeechatRepository.updateStatus(coffeeChatId, status);
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
  async cancelCoffeeChat(coffeeChatId: string, userId: string) {
    const chat = await this._getChatOrThrow(coffeeChatId);
    this._validateRequesterAccess(chat, userId);
    this._validateCancelable(chat);

    return coffeechatRepository.cancelCoffeeChat(coffeeChatId, userId);
  },
};

export default coffeechatService;

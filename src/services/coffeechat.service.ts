import coffeechatRepository from '../repositories/coffeechat.repository';
// import userRepository from '../repositories/user.repository'; // 비활성화 유저 검증용 (필요시)
import { CoffeeChatStatus } from '@prisma/client';

interface ServiceError {
  status: number;
  message: string;
}

const coffeechatService = {
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
      const error: ServiceError = { status: 400, message: '본인에게는 커피챗을 신청할 수 없습니다.' };
      throw error;
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
      const error: ServiceError = { status: 409, message: '이미 대기 중인 커피챗이 있습니다.' };
      throw error;
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
    const chat = await coffeechatRepository.getCoffeeChatDetail(coffeeChatId);
    if (!chat) {
      const error: ServiceError = { status: 404, message: '해당 커피챗이 존재하지 않습니다.' };
      throw error;
    }
    if (chat.receiverId !== userId) {
      const error: ServiceError = { status: 403, message: '수락/거절은 받은 사람만 할 수 있습니다.' };
      throw error;
    }
    if (chat.status !== 'pending') {
      const error: ServiceError = { status: 400, message: '이미 처리된 커피챗입니다.' };
      throw error;
    }

    // 상대방이 비활성화 유저인지 체크
    // const targetUser = await userRepository.getUserById(chat.requesterId);
    // if (targetUser?.status === 'inactive') {
    //   const error: ServiceError = { status: 400, message: '비활성화 유저와의 커피챗은 처리할 수 없습니다.' };
    //   throw error;
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
    const chat = await coffeechatRepository.getCoffeeChatDetail(coffeeChatId);
    if (!chat) {
      const error: ServiceError = { status: 404, message: '해당 커피챗이 존재하지 않습니다.' };
      throw error;
    }
    if (chat.requesterId !== userId && chat.receiverId !== userId) {
      const error: ServiceError = { status: 403, message: '해당 커피챗에 접근할 권한이 없습니다.' };
      throw error;
    }
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
    const chat = await coffeechatRepository.getCoffeeChatDetail(coffeeChatId);
    if (!chat) {
      const error: ServiceError = { status: 404, message: '해당 커피챗이 존재하지 않습니다.' };
      throw error;
    }
    if (chat.requesterId !== userId) {
      const error: ServiceError = { status: 403, message: '본인이 신청한 커피챗만 취소할 수 있습니다.' };
      throw error;
    }
    if (chat.status !== 'pending') {
      const error: ServiceError = { status: 400, message: '이미 처리된 커피챗은 취소할 수 없습니다.' };
      throw error;
    }

    return coffeechatRepository.cancelCoffeeChat(coffeeChatId, userId);
  },
};

export default coffeechatService;

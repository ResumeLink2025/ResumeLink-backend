import prisma from '../lib/prisma';
import { CoffeeChatStatus } from '@prisma/client';

export class CoffeeChatRepository {
  // 1. 커피챗 생성
  async createCoffeeChat(requesterId: string, receiverId: string) {
    return prisma.coffeeChat.create({
      data: {
        requesterId,
        receiverId,
        status: CoffeeChatStatus.pending,
      },
    });
  }

  // 2. 상태 변경 (수락/거절)
  async updateStatus(coffeeChatId: string, status: CoffeeChatStatus) {
    return prisma.coffeeChat.update({
      where: { id: coffeeChatId },
      data: {
        status,
        respondedAt: new Date(),
      },
    });
  }

  // 3. 대기중인(진행중) 커피챗 중 중복 확인
  async findPendingBetween(requesterId: string, receiverId: string) {
    return prisma.coffeeChat.findFirst({
      where: {
        requesterId,
        receiverId,
        status: CoffeeChatStatus.pending,
      },
    });
  }

  // 4. 내가 신청한 커피챗 목록
  async getRequestedChats(userId: string) {
    return prisma.coffeeChat.findMany({
      where: { requesterId: userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 5. 내가 받은 커피챗 목록
  async getReceivedChats(userId: string) {
    return prisma.coffeeChat.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 6. 신청/받은 전체 커피챗 목록
  async getAllChats(userId: string) {
    return prisma.coffeeChat.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 7. 커피챗 단일 상세 조회 (서비스에서 권한 검증 완료)
  async getCoffeeChatDetail(coffeeChatId: string) {
    return prisma.coffeeChat.findUnique({
      where: { id: coffeeChatId }
    });
  }

  // 8. 커피챗 취소(삭제) - 본인+대기상태만
  async cancelCoffeeChat(coffeeChatId: string, userId: string) {
    return prisma.coffeeChat.deleteMany({
      where: {
        id: coffeeChatId,
        requesterId: userId,
        status: CoffeeChatStatus.pending,
      }
    });
  }
}

const coffeechatRepository = new CoffeeChatRepository();
export default coffeechatRepository;

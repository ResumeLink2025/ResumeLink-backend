import { Message, UserAuth } from '@prisma/client';
import prisma from '../lib/prisma';

export type MessageWithSender = Message & {
  sender: UserAuth & {
    profile: {
      nickname: string;
      imageUrl: string | null;
    } | null;
  };
};

export class MessageRepository {
  // 메시지 전송
  async createMessage(data: {
    chatRoomId: string;
    senderId: string;
    text?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  }): Promise<MessageWithSender> {
    return await prisma.message.create({
      data,
      include: {
        sender: {
          include: {
            profile: {
              select: {
                nickname: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });
  }

  // 채팅방의 메시지 목록 조회 (커서 기반 페이지네이션)
  async findMessagesByChatRoomId(
    chatRoomId: string,
    options: {
      limit: number;
      cursor?: string;
      direction?: 'before' | 'after';
    }
  ): Promise<MessageWithSender[]> {
    const { limit, cursor, direction = 'before' } = options;

    const whereClause: any = {
      chatRoomId,
      isDeleted: false
    };

    // 커서 기반 페이지네이션
    if (cursor) {
      whereClause.id = direction === 'before' 
        ? { lt: cursor }  // 이전 메시지들
        : { gt: cursor }; // 이후 메시지들
    }

    return await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          include: {
            profile: {
              select: {
                nickname: true,
                imageUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: direction === 'before' ? 'desc' : 'asc'
      },
      take: limit
    });
  }

  // 특정 메시지 조회
  async findMessageById(messageId: string): Promise<MessageWithSender | null> {
    return await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          include: {
            profile: {
              select: {
                nickname: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });
  }

  // 메시지 수정
  async updateMessage(messageId: string, text: string): Promise<MessageWithSender> {
    return await prisma.message.update({
      where: { id: messageId },
      data: {
        text,
        isEdited: true,
        updatedAt: new Date()
      },
      include: {
        sender: {
          include: {
            profile: {
              select: {
                nickname: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });
  }

  // 메시지 삭제 (소프트 삭제)
  async deleteMessage(messageId: string): Promise<void> {
    await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        text: null,  // 텍스트 내용 제거
        fileUrl: null,  // 파일 정보 제거
        fileName: null,
        fileSize: null
      }
    });
  }

  // 읽음 상태 업데이트
  async markAsRead(chatRoomId: string, userId: string, messageId: string): Promise<void> {
    await prisma.chatParticipant.updateMany({
      where: {
        chatRoomId,
        userId,
        leftAt: null  // 활성 참여자만
      },
      data: {
        lastReadMessageId: messageId
      }
    });
  }

  // 채팅방의 총 메시지 수 (삭제되지 않은 것만)
  async getMessageCount(chatRoomId: string): Promise<number> {
    return await prisma.message.count({
      where: {
        chatRoomId,
        isDeleted: false
      }
    });
  }

  // 미읽은 메시지 수 계산
  async getUnreadMessageCount(chatRoomId: string, userId: string): Promise<number> {
    // 사용자의 마지막 읽은 메시지 조회
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        chatRoomId,
        userId,
        leftAt: null
      },
      select: {
        lastReadMessageId: true,
        lastReadMessage: {
          select: {
            createdAt: true
          }
        }
      }
    });

    if (!participant || !participant.lastReadMessage) {
      // 아직 읽은 메시지가 없으면 모든 메시지가 미읽음
      return await this.getMessageCount(chatRoomId);
    }

    // 마지막 읽은 메시지 이후의 메시지 수 계산
    return await prisma.message.count({
      where: {
        chatRoomId,
        isDeleted: false,
        createdAt: {
          gt: participant.lastReadMessage.createdAt
        }
      }
    });
  }

  // 메시지 발신자인지 확인
  async isMessageSender(messageId: string, userId: string): Promise<boolean> {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { senderId: true }
    });

    return message?.senderId === userId;
  }
}

import { Message, UserAuth } from '@prisma/client';
import prisma from '../lib/prisma';
import { ChatRepository } from './chat.repository';

export type MessageWithSender = Message & {
  sender: UserAuth & {
    profile: {
      nickname: string;
      imageUrl: string | null;
    } | null;
  };
};

export class MessageRepository {
  private chatRepository: ChatRepository;

  constructor() {
    this.chatRepository = new ChatRepository();
  }

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
    const message = await prisma.message.create({
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

    // 캐시 무효화: 메시지 전송 시 관련 캐시들 무효화
    const participants = await prisma.chatParticipant.findMany({
      where: {
        chatRoomId: data.chatRoomId,
        leftAt: null
      },
      select: {
        userId: true
      }
    });

    const participantUserIds = participants.map(p => p.userId);
    this.chatRepository.invalidateAllChatRoomCaches(data.chatRoomId, participantUserIds);

    return message;
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
      // 아직 읽은 메시지가 없으면 모든 메시지가 미읽음 (자신이 보낸 메시지 제외)
      return await prisma.message.count({
        where: {
          chatRoomId,
          isDeleted: false,
          senderId: { not: userId }
        }
      });
    }

    // 마지막 읽은 메시지 이후의 메시지 수 계산 (자신이 보낸 메시지 제외)
    return await prisma.message.count({
      where: {
        chatRoomId,
        isDeleted: false,
        senderId: { not: userId },
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

  // 미읽은 메시지 일괄 읽음 처리
  async markAllUnreadMessagesAsRead(
    chatRoomId: string, 
    userId: string
  ): Promise<{ readCount: number; lastReadMessageId?: string }> {
    // 1. 현재 사용자의 참여 정보 조회
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        chatRoomId,
        userId,
        leftAt: null  // 활성 참여자만
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

    if (!participant) {
      return { readCount: 0 };
    }

    // 2. 마지막 읽은 메시지 이후의 미읽은 메시지들 조회
    const whereClause: any = {
      chatRoomId,
      isDeleted: false,
      senderId: { not: userId }  // 본인이 보낸 메시지는 제외
    };

    if (participant.lastReadMessage) {
      whereClause.createdAt = {
        gt: participant.lastReadMessage.createdAt
      };
    }

    const unreadMessages = await prisma.message.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        createdAt: true
      }
    });

    // 3. 읽을 메시지가 없으면 종료
    if (unreadMessages.length === 0) {
      return { readCount: 0 };
    }

    // 4. 가장 최신 메시지를 마지막 읽은 메시지로 설정
    const lastReadMessageId = unreadMessages[0].id;

    await prisma.chatParticipant.updateMany({
      where: {
        chatRoomId,
        userId,
        leftAt: null
      },
      data: {
        lastReadMessageId
      }
    });

    return {
      readCount: unreadMessages.length,
      lastReadMessageId
    };
  }

  // 첫 번째 미읽은 메시지 ID 조회
  async getFirstUnreadMessageId(chatRoomId: string, userId: string): Promise<string | null> {
    // 1. 사용자의 참여자 정보 조회
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        chatRoomId,
        userId,
        leftAt: null
      }
    });

    if (!participant) {
      return null;
    }

    // 2. lastReadMessageId 이후의 첫 번째 메시지 조회
    const firstUnreadMessage = await prisma.message.findFirst({
      where: {
        chatRoomId,
        isDeleted: false,
        senderId: { not: userId }, // 본인이 보낸 메시지 제외
        ...(participant.lastReadMessageId
          ? {
              createdAt: {
                gt: await prisma.message
                  .findUnique({
                    where: { id: participant.lastReadMessageId },
                    select: { createdAt: true }
                  })
                  .then(msg => msg?.createdAt)
              }
            }
          : {}) // lastReadMessageId가 없으면 가장 오래된 메시지부터
      },
      orderBy: {
        createdAt: 'asc' // 오래된 순서로 정렬하여 첫 번째 미읽은 메시지 찾기
      },
      select: {
        id: true
      }
    });

    return firstUnreadMessage?.id || null;
  }
}

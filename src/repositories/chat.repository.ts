import { ChatRoom, ChatParticipant, Message, UserAuth } from '@prisma/client';
import prisma from '../lib/prisma';

export type ChatRoomWithDetails = ChatRoom & {
  participants: (ChatParticipant & {
    user: UserAuth & {
      profile: {
        nickname: string;
        imageUrl: string | null;
      } | null;
    };
  })[];
  messages: Message[];
  _count: {
    messages: number;
  };
};

export type ChatRoomListItem = ChatRoom & {
  participants: (ChatParticipant & {
    user: UserAuth & {
      profile: {
        nickname: string;
        imageUrl: string | null;
      } | null;
    };
  })[];
  messages: Message[];
};

export class ChatRepository {
  // 두 사용자 간의 기존 채팅방 조회
  async findChatRoomByParticipants(userId1: string, userId2: string): Promise<ChatRoom | null> {
    return prisma.chatRoom.findFirst({
      where: {
        participants: {
          some: {
            userId: userId1
          }
        },
        AND: {
          participants: {
            some: {
              userId: userId2
            }
          }
        }
      },
      include: {
        participants: true
      }
    });
  }

  // 채팅방 생성
  async createChatRoom(participant1Id: string, participant2Id: string): Promise<any> {
    return prisma.chatRoom.create({
      data: {
        participants: {
          create: [
            {
              userId: participant1Id
            },
            {
              userId: participant2Id
            }
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
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
        }
      }
    });
  }

  // 특정 채팅방 조회 (상세 정보 포함)
  async findChatRoomById(chatRoomId: string): Promise<any> {
    return prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        participants: {
          include: {
            user: {
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
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          where: {
            isDeleted: false
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                isDeleted: false
              }
            }
          }
        }
      }
    });
  }

  // 사용자의 채팅방 목록 조회
  async findChatRoomsByUserId(userId: string): Promise<any[]> {
    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
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
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          where: {
            isDeleted: false
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return chatRooms;
  }

  // 채팅방 참여자인지 확인
  async isChatRoomParticipant(chatRoomId: string, userId: string): Promise<boolean> {
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        chatRoomId,
        userId
      }
    });
    return !!participant;
  }

  // 채팅방 나가기 (향후 구현)
  async leaveChatRoom(chatRoomId: string, userId: string): Promise<any> {
    // leftAt 필드가 마이그레이션 후 사용 가능해지면 구현
    return null;
  }

  // 채팅방의 미읽은 메시지 수 계산 (향후 구현)
  async getUnreadMessageCount(chatRoomId: string, userId: string): Promise<number> {
    // lastReadMessage 관계가 설정된 후 구현
    return 0;
  }
}

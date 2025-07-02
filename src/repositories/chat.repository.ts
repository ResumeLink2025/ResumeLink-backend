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
  // 커피챗 ID로 기존 채팅방 조회
  async findChatRoomByCoffeeChatId(coffeeChatId: string): Promise<ChatRoom | null> {
    return prisma.chatRoom.findUnique({
      where: { coffeeChatId },
      include: {
        participants: true
      }
    });
  }

  // 커피챗 수락 시 채팅방 생성
  async createChatRoomFromCoffeeChat(coffeeChatId: string, participant1Id: string, participant2Id: string): Promise<any> {
    return prisma.chatRoom.create({
      data: {
        coffeeChatId,
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

  // 채팅방 나가기
  async leaveChatRoom(chatRoomId: string, userId: string): Promise<any> {
    return null;
  }

  // 채팅방의 미읽은 메시지 수 계산
  async getUnreadMessageCount(chatRoomId: string, userId: string): Promise<number> {
    return 0;
  }
}

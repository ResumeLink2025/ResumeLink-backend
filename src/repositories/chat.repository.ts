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

  // 사용자의 채팅방 목록 조회 (isVisible=true만)
  async findChatRoomsByUserId(userId: string): Promise<any[]> {
    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        participants: {
          some: {
            userId: userId,
            isVisible: true, // 보이는 채팅방만
            leftAt: null     // 나가지 않은 상태만
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

  // 채팅방 참여자인지 확인 (활성 상태만)
  async isChatRoomParticipant(chatRoomId: string, userId: string): Promise<boolean> {
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        chatRoomId,
        userId,
        leftAt: null // 나가지 않은 상태만
      }
    });
    return !!participant;
  }

  // 채팅방 나가기
  async leaveChatRoom(chatRoomId: string, userId: string): Promise<{ shouldArchiveRoom: boolean }> {
    return await prisma.$transaction(async (tx) => {
      // 1. 현재 사용자의 참여자 레코드 찾기
      const participant = await tx.chatParticipant.findFirst({
        where: {
          chatRoomId,
          userId,
          leftAt: null
        }
      });

      if (!participant) {
        throw new Error('참여자를 찾을 수 없거나 이미 나간 상태입니다.');
      }

      // 2. 참여자 레코드 업데이트
      await tx.chatParticipant.update({
        where: { id: participant.id },
        data: {
          leftAt: new Date(),
          isVisible: false
        }
      });

      // 3. 남아있는 활성 참여자 수 확인
      const activeParticipants = await tx.chatParticipant.count({
        where: {
          chatRoomId,
          leftAt: null
        }
      });

      // 4. 모든 참여자가 나갔으면 채팅방을 archived 상태로 변경
      let shouldArchiveRoom = false;
      if (activeParticipants === 0) {
        await tx.chatRoom.update({
          where: { id: chatRoomId },
          data: { status: 'archived' }
        });
        shouldArchiveRoom = true;
      }

      return { shouldArchiveRoom };
    });
  }

  // 채팅방의 미읽은 메시지 수 계산
  async getUnreadMessageCount(chatRoomId: string, userId: string): Promise<number> {
    return 0;
  }
}

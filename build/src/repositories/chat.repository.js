"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRepository = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
class ChatRepository {
    constructor() {
        // 캐시 저장소들
        this.chatRoomsCache = new Map();
        this.participantCache = new Map();
        this.chatRoomDetailsCache = new Map();
        // 캐시 TTL (Time To Live) - 30초
        this.CACHE_TTL = 30000;
    }
    /**
     * 캐시 만료 확인
     */
    isCacheExpired(cacheEntry) {
        return Date.now() - cacheEntry.timestamp > this.CACHE_TTL;
    }
    /**
     * 캐시 생성
     */
    createCacheEntry(data) {
        return {
            data,
            timestamp: Date.now()
        };
    }
    // 커피챗 ID로 기존 채팅방 조회
    findChatRoomByCoffeeChatId(coffeeChatId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.chatRoom.findUnique({
                where: { coffeeChatId },
                include: {
                    participants: true
                }
            });
        });
    }
    // 커피챗 수락 시 채팅방 생성
    createChatRoomFromCoffeeChat(coffeeChatId, participant1Id, participant2Id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.chatRoom.create({
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
        });
    }
    // 특정 채팅방 조회 (상세 정보 포함) - 캐싱 적용
    findChatRoomById(chatRoomId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. 캐시 확인
            const cacheKey = `chatroom_details_${chatRoomId}`;
            const cached = this.chatRoomDetailsCache.get(cacheKey);
            if (cached && !this.isCacheExpired(cached)) {
                console.log(`[Cache Hit] 채팅방 상세 정보 (${chatRoomId})`);
                return cached.data;
            }
            console.log(`[Cache Miss] 채팅방 상세 정보 - DB에서 가져옴 (${chatRoomId})`);
            // 2. DB에서 채팅방 상세 정보 조회
            const chatRoom = yield prisma_1.default.chatRoom.findUnique({
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
            // 3. 캐시에 저장
            this.chatRoomDetailsCache.set(cacheKey, this.createCacheEntry(chatRoom));
            return chatRoom;
        });
    }
    // 사용자의 채팅방 목록 조회 (isVisible=true만) - 캐싱 적용
    findChatRoomsByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. 캐시 확인
            const cacheKey = `chatrooms_${userId}`;
            const cached = this.chatRoomsCache.get(cacheKey);
            if (cached && !this.isCacheExpired(cached)) {
                console.log(`[Cache Hit] 채팅방 목록 (${userId})`);
                return cached.data;
            }
            console.log(`[Cache Miss] 채팅방 목록 조회 - DB에서 가져옴 (${userId})`);
            // 2. 사용자의 활성 채팅방 정보 조회
            const chatRooms = yield prisma_1.default.chatRoom.findMany({
                where: {
                    participants: {
                        some: {
                            userId,
                            leftAt: null // 나가지 않은 상태만
                        }
                    }
                },
                include: {
                    participants: {
                        where: {
                            leftAt: null // 활성 참여자만
                        },
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
                        take: 1,
                        orderBy: {
                            createdAt: 'desc'
                        },
                        select: {
                            id: true,
                            text: true,
                            messageType: true,
                            createdAt: true,
                            sender: {
                                select: {
                                    id: true,
                                    profile: {
                                        select: {
                                            nickname: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            if (chatRooms.length === 0) {
                // 빈 배열도 캐시에 저장
                this.chatRoomsCache.set(cacheKey, this.createCacheEntry([]));
                return [];
            }
            // 3. Raw SQL을 사용하여 모든 채팅방의 미읽은 메시지 수를 한 번의 쿼리로 계산
            const unreadCountResults = yield prisma_1.default.$queryRaw `
      SELECT 
        cp."chatRoomId",
        COUNT(m.id)::integer as "unreadCount"
      FROM "ChatParticipant" cp
      LEFT JOIN "Message" m ON m."chatRoomId" = cp."chatRoomId" 
        AND m."senderId" != cp."userId"
        AND m."isDeleted" = false
        AND (
          cp."lastReadMessageId" IS NULL 
          OR m."createdAt" > (
            SELECT "createdAt" 
            FROM "Message" 
            WHERE id = cp."lastReadMessageId"
          )
        )
      WHERE cp."userId" = ${userId} AND cp."leftAt" IS NULL
      GROUP BY cp."chatRoomId"
    `;
            const unreadCountsMap = new Map(unreadCountResults.map((result) => [result.chatRoomId, result.unreadCount]));
            // 4. 결과 조합
            const chatRoomsWithUnreadCount = chatRooms.map((chatRoom) => (Object.assign(Object.assign({}, chatRoom), { unreadCount: unreadCountsMap.get(chatRoom.id) || 0 })));
            // 5. 캐시에 저장
            this.chatRoomsCache.set(cacheKey, this.createCacheEntry(chatRoomsWithUnreadCount));
            return chatRoomsWithUnreadCount;
        });
    }
    // 채팅방 참여자인지 확인 (활성 상태만) - 캐싱 적용
    isChatRoomParticipant(chatRoomId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. 캐시 확인
            const cacheKey = `participant_${chatRoomId}_${userId}`;
            const cached = this.participantCache.get(cacheKey);
            if (cached && !this.isCacheExpired(cached)) {
                console.log(`[Cache Hit] 참여자 확인 (${chatRoomId}, ${userId})`);
                return cached.data;
            }
            console.log(`[Cache Miss] 참여자 확인 - DB에서 가져옴 (${chatRoomId}, ${userId})`);
            // 2. DB에서 참여자 확인
            const participant = yield prisma_1.default.chatParticipant.findFirst({
                where: {
                    chatRoomId,
                    userId,
                    leftAt: null // 나가지 않은 상태만
                }
            });
            const isParticipant = !!participant;
            // 3. 캐시에 저장
            this.participantCache.set(cacheKey, this.createCacheEntry(isParticipant));
            return isParticipant;
        });
    }
    // 채팅방 나가기
    leaveChatRoom(chatRoomId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // 1. 현재 사용자의 참여자 레코드 찾기
                const participant = yield tx.chatParticipant.findFirst({
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
                yield tx.chatParticipant.update({
                    where: { id: participant.id },
                    data: {
                        leftAt: new Date(),
                        isVisible: false
                    }
                });
                // 3. 남아있는 활성 참여자 수 확인
                const activeParticipants = yield tx.chatParticipant.count({
                    where: {
                        chatRoomId,
                        leftAt: null
                    }
                });
                // 4. 모든 참여자가 나갔으면 채팅방을 archived 상태로 변경
                let shouldArchiveRoom = false;
                if (activeParticipants === 0) {
                    yield tx.chatRoom.update({
                        where: { id: chatRoomId },
                        data: { status: 'archived' }
                    });
                    shouldArchiveRoom = true;
                }
                return { shouldArchiveRoom };
            }));
        });
    }
    // 채팅방의 미읽은 메시지 수 계산
    getUnreadMessageCount(chatRoomId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 현재 사용자의 참여자 정보 조회
            const participant = yield prisma_1.default.chatParticipant.findFirst({
                where: {
                    chatRoomId,
                    userId,
                    leftAt: null
                }
            });
            if (!participant) {
                return 0;
            }
            // lastReadMessageId 이후의 메시지 수 계산
            const unreadCount = yield prisma_1.default.message.count({
                where: Object.assign({ chatRoomId, isDeleted: false, senderId: { not: userId } }, (participant.lastReadMessageId
                    ? {
                        createdAt: {
                            gt: yield prisma_1.default.message
                                .findUnique({
                                where: { id: participant.lastReadMessageId },
                                select: { createdAt: true }
                            })
                                .then(msg => msg === null || msg === void 0 ? void 0 : msg.createdAt)
                        }
                    }
                    : {}) // lastReadMessageId가 없으면 모든 메시지가 미읽음
                )
            });
            return unreadCount;
        });
    }
    /**
     * 캐시 무효화 메서드들
     */
    /**
     * 사용자의 채팅방 목록 캐시 무효화
     */
    invalidateChatRoomsCache(userId) {
        const cacheKey = `chatrooms_${userId}`;
        this.chatRoomsCache.delete(cacheKey);
        console.log(`[Cache Invalidated] 채팅방 목록 캐시 삭제 (${userId})`);
    }
    /**
     * 참여자 확인 캐시 무효화
     */
    invalidateParticipantCache(chatRoomId, userId) {
        const cacheKey = `participant_${chatRoomId}_${userId}`;
        this.participantCache.delete(cacheKey);
        console.log(`[Cache Invalidated] 참여자 확인 캐시 삭제 (${chatRoomId}, ${userId})`);
    }
    /**
     * 채팅방 상세 정보 캐시 무효화
     */
    invalidateChatRoomDetailsCache(chatRoomId) {
        const cacheKey = `chatroom_details_${chatRoomId}`;
        this.chatRoomDetailsCache.delete(cacheKey);
        console.log(`[Cache Invalidated] 채팅방 상세 정보 캐시 삭제 (${chatRoomId})`);
    }
    /**
     * 채팅방 관련 모든 캐시 무효화 (메시지 전송 시 사용)
     */
    invalidateAllChatRoomCaches(chatRoomId, participantUserIds) {
        // 채팅방 상세 정보 캐시 무효화
        this.invalidateChatRoomDetailsCache(chatRoomId);
        // 각 참여자의 채팅방 목록 캐시 무효화
        participantUserIds.forEach(userId => {
            this.invalidateChatRoomsCache(userId);
            this.invalidateParticipantCache(chatRoomId, userId);
        });
    }
    /**
     * 캐시 통계 조회 (개발/디버깅용)
     */
    getCacheStats() {
        return {
            chatRoomsCache: this.chatRoomsCache.size,
            participantCache: this.participantCache.size,
            chatRoomDetailsCache: this.chatRoomDetailsCache.size
        };
    }
    /**
     * 만료된 캐시 정리 (메모리 관리)
     */
    cleanupExpiredCaches() {
        const now = Date.now();
        // 채팅방 목록 캐시 정리
        for (const [key, value] of this.chatRoomsCache.entries()) {
            if (now - value.timestamp > this.CACHE_TTL) {
                this.chatRoomsCache.delete(key);
            }
        }
        // 참여자 캐시 정리
        for (const [key, value] of this.participantCache.entries()) {
            if (now - value.timestamp > this.CACHE_TTL) {
                this.participantCache.delete(key);
            }
        }
        // 채팅방 상세 정보 캐시 정리
        for (const [key, value] of this.chatRoomDetailsCache.entries()) {
            if (now - value.timestamp > this.CACHE_TTL) {
                this.chatRoomDetailsCache.delete(key);
            }
        }
        console.log('[Cache Cleanup] 만료된 캐시 정리 완료');
    }
}
exports.ChatRepository = ChatRepository;

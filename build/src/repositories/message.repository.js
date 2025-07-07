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
exports.MessageRepository = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const chat_repository_1 = require("./chat.repository");
class MessageRepository {
    constructor() {
        this.chatRepository = new chat_repository_1.ChatRepository();
    }
    // 메시지 전송
    createMessage(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield prisma_1.default.message.create({
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
            const participants = yield prisma_1.default.chatParticipant.findMany({
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
        });
    }
    // 채팅방의 메시지 목록 조회 (커서 기반 페이지네이션)
    findMessagesByChatRoomId(chatRoomId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, cursor, direction = 'before' } = options;
            const whereClause = {
                chatRoomId,
                isDeleted: false
            };
            // 커서 기반 페이지네이션
            if (cursor) {
                whereClause.id = direction === 'before'
                    ? { lt: cursor } // 이전 메시지들
                    : { gt: cursor }; // 이후 메시지들
            }
            return yield prisma_1.default.message.findMany({
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
        });
    }
    // 특정 메시지 조회
    findMessageById(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.default.message.findUnique({
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
        });
    }
    // 메시지 수정
    updateMessage(messageId, text) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.default.message.update({
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
        });
    }
    // 메시지 삭제 (소프트 삭제)
    deleteMessage(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma_1.default.message.update({
                where: { id: messageId },
                data: {
                    isDeleted: true,
                    text: null, // 텍스트 내용 제거
                    fileUrl: null, // 파일 정보 제거
                    fileName: null,
                    fileSize: null
                }
            });
        });
    }
    // 읽음 상태 업데이트
    markAsRead(chatRoomId, userId, messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma_1.default.chatParticipant.updateMany({
                where: {
                    chatRoomId,
                    userId,
                    leftAt: null // 활성 참여자만
                },
                data: {
                    lastReadMessageId: messageId
                }
            });
        });
    }
    // 채팅방의 총 메시지 수 (삭제되지 않은 것만)
    getMessageCount(chatRoomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.default.message.count({
                where: {
                    chatRoomId,
                    isDeleted: false
                }
            });
        });
    }
    // 미읽은 메시지 수 계산
    getUnreadMessageCount(chatRoomId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 사용자의 마지막 읽은 메시지 조회
            const participant = yield prisma_1.default.chatParticipant.findFirst({
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
                return yield prisma_1.default.message.count({
                    where: {
                        chatRoomId,
                        isDeleted: false,
                        senderId: { not: userId }
                    }
                });
            }
            // 마지막 읽은 메시지 이후의 메시지 수 계산 (자신이 보낸 메시지 제외)
            return yield prisma_1.default.message.count({
                where: {
                    chatRoomId,
                    isDeleted: false,
                    senderId: { not: userId },
                    createdAt: {
                        gt: participant.lastReadMessage.createdAt
                    }
                }
            });
        });
    }
    // 메시지 발신자인지 확인
    isMessageSender(messageId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield prisma_1.default.message.findUnique({
                where: { id: messageId },
                select: { senderId: true }
            });
            return (message === null || message === void 0 ? void 0 : message.senderId) === userId;
        });
    }
    // 미읽은 메시지 일괄 읽음 처리
    markAllUnreadMessagesAsRead(chatRoomId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. 현재 사용자의 참여 정보 조회
            const participant = yield prisma_1.default.chatParticipant.findFirst({
                where: {
                    chatRoomId,
                    userId,
                    leftAt: null // 활성 참여자만
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
            const whereClause = {
                chatRoomId,
                isDeleted: false,
                senderId: { not: userId } // 본인이 보낸 메시지는 제외
            };
            if (participant.lastReadMessage) {
                whereClause.createdAt = {
                    gt: participant.lastReadMessage.createdAt
                };
            }
            const unreadMessages = yield prisma_1.default.message.findMany({
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
            yield prisma_1.default.chatParticipant.updateMany({
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
        });
    }
    // 첫 번째 미읽은 메시지 ID 조회
    getFirstUnreadMessageId(chatRoomId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. 사용자의 참여자 정보 조회
            const participant = yield prisma_1.default.chatParticipant.findFirst({
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
            const firstUnreadMessage = yield prisma_1.default.message.findFirst({
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
                    : {}) // lastReadMessageId가 없으면 가장 오래된 메시지부터
                ),
                orderBy: {
                    createdAt: 'asc' // 오래된 순서로 정렬하여 첫 번째 미읽은 메시지 찾기
                },
                select: {
                    id: true
                }
            });
            return (firstUnreadMessage === null || firstUnreadMessage === void 0 ? void 0 : firstUnreadMessage.id) || null;
        });
    }
}
exports.MessageRepository = MessageRepository;

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
exports.ChatRoomService = void 0;
const chat_repository_1 = require("../repositories/chat.repository");
const chat_dto_1 = require("../dtos/chat.dto");
const chat_types_1 = require("../types/chat.types");
const class_transformer_1 = require("class-transformer");
const prisma_1 = __importDefault(require("../lib/prisma"));
class ChatRoomService {
    constructor(chatRepository = new chat_repository_1.ChatRepository()) {
        this.chatRepository = chatRepository;
    }
    // 커피챗 수락 시 채팅방 생성 또는 기존 방 반환
    createOrGetChatRoom(currentUserId, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { participantId } = input;
            // 본인과의 채팅 방지
            if (currentUserId === participantId) {
                throw chat_types_1.ChatErrors.SELF_CHAT_NOT_ALLOWED();
            }
            // 커피챗 존재 확인 (수락된 상태여야 함)
            const coffeeChat = yield this.findAcceptedCoffeeChat(currentUserId, participantId);
            if (!coffeeChat) {
                throw chat_types_1.ChatErrors.NO_ACCEPTED_COFFEECHAT('수락된 커피챗이 없습니다.');
            }
            // 기존 채팅방 조회
            const existingChatRoom = yield this.chatRepository.findChatRoomByCoffeeChatId(coffeeChat.id);
            if (existingChatRoom) {
                return this.transformToChatRoomResponse(existingChatRoom);
            }
            // 새 채팅방 생성
            const newChatRoom = yield this.chatRepository.createChatRoomFromCoffeeChat(coffeeChat.id, currentUserId, participantId);
            return this.transformToChatRoomResponse(newChatRoom);
        });
    }
    // 수락된 커피챗 찾기
    findAcceptedCoffeeChat(userId1, userId2) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.coffeeChat.findFirst({
                where: {
                    status: 'accepted',
                    OR: [
                        { requesterId: userId1, receiverId: userId2 },
                        { requesterId: userId2, receiverId: userId1 }
                    ]
                }
            });
        });
    }
    // 사용자의 채팅방 목록 조회
    getChatRoomList(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const chatRooms = yield this.chatRepository.findChatRoomsByUserId(userId);
            const transformedChatRooms = chatRooms.map(room => this.transformToChatRoomResponse(room));
            return (0, class_transformer_1.plainToInstance)(chat_dto_1.ChatRoomListResponseDto, {
                chatRooms: transformedChatRooms,
                total: transformedChatRooms.length
            });
        });
    }
    // 특정 채팅방 상세 조회
    getChatRoomById(chatRoomId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 참여자 권한 확인
            const isParticipant = yield this.chatRepository.isChatRoomParticipant(chatRoomId, userId);
            if (!isParticipant) {
                throw chat_types_1.ChatErrors.ACCESS_DENIED();
            }
            const chatRoom = yield this.chatRepository.findChatRoomById(chatRoomId);
            if (!chatRoom) {
                throw chat_types_1.ChatErrors.ROOM_NOT_FOUND();
            }
            return this.transformToChatRoomResponse(chatRoom);
        });
    }
    // 채팅방 나가기 (개선된 로직)
    leaveChatRoom(chatRoomId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 참여자 권한 확인
            const isParticipant = yield this.chatRepository.isChatRoomParticipant(chatRoomId, userId);
            if (!isParticipant) {
                throw chat_types_1.ChatErrors.ACCESS_DENIED();
            }
            // 채팅방 나가기 실행
            const result = yield this.chatRepository.leaveChatRoom(chatRoomId, userId);
            // 로그 기록 (선택사항)
            if (result.shouldArchiveRoom) {
                console.log(`채팅방 ${chatRoomId}가 아카이브되었습니다. 모든 참여자가 나갔습니다.`);
            }
        });
    }
    // 데이터 변환 헬퍼 메서드
    transformToChatRoomResponse(chatRoom) {
        var _a, _b;
        const participants = ((_a = chatRoom.participants) === null || _a === void 0 ? void 0 : _a.map((participant) => {
            const userInfo = {
                id: participant.user.id,
                email: participant.user.email,
                profile: participant.user.profile ? {
                    nickname: participant.user.profile.nickname,
                    imageUrl: participant.user.profile.imageUrl
                } : undefined
            };
            return (0, class_transformer_1.plainToInstance)(chat_dto_1.ChatParticipantResponseDto, {
                id: participant.id,
                userId: participant.userId,
                joinedAt: participant.joinedAt || participant.createdAt,
                leftAt: participant.leftAt,
                user: userInfo
            });
        })) || [];
        const lastMessage = ((_b = chatRoom.messages) === null || _b === void 0 ? void 0 : _b[0]) ? {
            id: chatRoom.messages[0].id,
            text: chatRoom.messages[0].text,
            messageType: chatRoom.messages[0].messageType || 'TEXT',
            createdAt: chatRoom.messages[0].createdAt.toISOString(),
            senderId: chatRoom.messages[0].senderId
        } : undefined;
        return (0, class_transformer_1.plainToInstance)(chat_dto_1.ChatRoomResponseDto, {
            id: chatRoom.id,
            coffeeChatId: chatRoom.coffeeChatId,
            createdAt: chatRoom.createdAt.toISOString(),
            participants,
            lastMessage,
            unreadCount: chatRoom.unreadCount || 0 // 실제 미읽은 메시지 수 사용
        });
    }
    // 캐시 통계 조회 (개발/디버깅용)
    getCacheStats() {
        return this.chatRepository.getCacheStats();
    }
    // 캐시 수동 정리 (개발/디버깅용)
    cleanupExpiredCaches() {
        this.chatRepository.cleanupExpiredCaches();
    }
}
exports.ChatRoomService = ChatRoomService;

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const coffeechat_repository_1 = __importDefault(require("../repositories/coffeechat.repository"));
// import userRepository from '../repositories/user.repository'; // 비활성화 유저 검증용 (필요시)
const client_1 = require("@prisma/client");
const ServiceError_1 = require("../utils/ServiceError");
const coffeechat_types_1 = require("../types/coffeechat.types");
const coffeechatService = {
    /**
     * 커피챗 정보 조회 헬퍼 메서드
     *
     * @param coffeeChatId - 커피챗 ID
     * @returns 커피챗 정보
     * @throws {ServiceError} 커피챗이 존재하지 않는 경우
     */
    _getChatOrThrow(coffeeChatId) {
        return __awaiter(this, void 0, void 0, function* () {
            const chat = yield coffeechat_repository_1.default.getCoffeeChatDetail(coffeeChatId);
            if (!chat) {
                throw coffeechat_types_1.CoffeeChatErrors.NOT_FOUND();
            }
            return chat;
        });
    },
    /**
     * 커피챗 접근 권한 검증 헬퍼 메서드
     *
     * @param chat - 커피챗 정보
     * @param userId - 사용자 ID
     * @throws {ServiceError} 접근 권한이 없는 경우
     */
    _validateChatAccess(chat, userId) {
        if (chat.requesterId !== userId && chat.receiverId !== userId) {
            throw coffeechat_types_1.CoffeeChatErrors.ACCESS_DENIED();
        }
    },
    /**
     * 커피챗 수신자 권한 검증 헬퍼 메서드
     *
     * @param chat - 커피챗 정보
     * @param userId - 사용자 ID
     * @throws {ServiceError} 수신자가 아닌 경우
     */
    _validateReceiverAccess(chat, userId) {
        if (chat.receiverId !== userId) {
            throw coffeechat_types_1.CoffeeChatErrors.RECEIVER_ONLY();
        }
    },
    /**
     * 커피챗 신청자 권한 검증 헬퍼 메서드
     *
     * @param chat - 커피챗 정보
     * @param userId - 사용자 ID
     * @throws {ServiceError} 신청자가 아닌 경우
     */
    _validateRequesterAccess(chat, userId) {
        if (chat.requesterId !== userId) {
            throw coffeechat_types_1.CoffeeChatErrors.REQUESTER_ONLY();
        }
    },
    /**
     * 커피챗 대기 상태 검증 헬퍼 메서드
     *
     * @param chat - 커피챗 정보
     * @throws {ServiceError} 대기 상태가 아닌 경우
     */
    _validatePendingStatus(chat) {
        if (chat.status !== 'pending') {
            throw coffeechat_types_1.CoffeeChatErrors.ALREADY_PROCESSED();
        }
    },
    /**
     * 커피챗 취소 가능 상태 검증 헬퍼 메서드
     *
     * @param chat - 커피챗 정보
     * @throws {ServiceError} 취소할 수 없는 상태인 경우
     */
    _validateCancelable(chat) {
        if (chat.status !== 'pending') {
            throw new ServiceError_1.ServiceError(400, '이미 처리된 커피챗은 취소할 수 없습니다.');
        }
    },
    /**
     * 커피챗 신청 생성
     *
     * @param requesterId - 신청자 ID
     * @param receiverId - 수신자 ID
     * @returns 생성된 커피챗 정보
     * @throws {ServiceError} 본인 신청, 중복 신청 등의 경우 에러 발생
     */
    createCoffeeChat(requesterId, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (requesterId === receiverId) {
                throw coffeechat_types_1.CoffeeChatErrors.SELF_REQUEST_NOT_ALLOWED();
            }
            // (Optional) 비활성화 유저 체크
            // const targetUser = await userRepository.getUserById(receiverId);
            // if (!targetUser || targetUser.status === 'inactive') {
            //   const error: ServiceError = { status: 400, message: '비활성화된 유저에게는 신청할 수 없습니다.' };
            //   throw error;
            // }
            // 중복 대기 커피챗 체크
            const exist = yield coffeechat_repository_1.default.findPendingBetween(requesterId, receiverId);
            if (exist) {
                throw coffeechat_types_1.CoffeeChatErrors.DUPLICATE_REQUEST();
            }
            return coffeechat_repository_1.default.createCoffeeChat(requesterId, receiverId);
        });
    },
    /**
     * 커피챗 상태 변경 (수락/거절)
     *
     * @param coffeeChatId - 커피챗 ID
     * @param status - 변경할 상태 (accepted/rejected)
     * @param userId - 상태를 변경하는 사용자 ID (수신자만 가능)
     * @returns 업데이트된 커피챗 정보 (수락 시 채팅방 정보 포함)
     * @throws {ServiceError} 권한 없음, 이미 처리됨 등의 경우 에러 발생
     */
    updateStatus(coffeeChatId, status, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const chat = yield this._getChatOrThrow(coffeeChatId);
            this._validateReceiverAccess(chat, userId);
            this._validatePendingStatus(chat);
            // 상대방이 비활성화 유저인지 체크
            // const targetUser = await userRepository.getUserById(chat.requesterId);
            // if (targetUser?.status === 'inactive') {
            //   throw new ServiceError(400, '비활성화 유저와의 커피챗은 처리할 수 없습니다.');
            // }
            const updatedChat = yield coffeechat_repository_1.default.updateStatus(coffeeChatId, status);
            // 커피챗 수락 시 자동으로 채팅방 생성 및 정보 반환
            if (status === client_1.CoffeeChatStatus.accepted) {
                try {
                    // 동적 import로 순환 참조 방지
                    const { ChatRoomService } = yield Promise.resolve().then(() => __importStar(require('./chat.service')));
                    const chatService = new ChatRoomService();
                    const chatRoom = yield chatService.createOrGetChatRoom(userId, {
                        participantId: chat.requesterId
                    });
                    console.log(`[CoffeeChat] 수락 후 채팅방 자동 생성: ${coffeeChatId} -> 채팅방: ${chatRoom.id}`);
                    // 채팅방 정보 포함하여 반환
                    return Object.assign(Object.assign({}, updatedChat), { chatRoom: {
                            id: chatRoom.id,
                            message: '채팅방이 생성되었습니다. 대화를 시작해보세요!'
                        } });
                }
                catch (error) {
                    console.error('[CoffeeChat] 채팅방 자동 생성 실패:', error);
                    // 채팅방 생성 실패해도 커피챗 수락은 유지하고 안내 메시지만 추가
                    return Object.assign(Object.assign({}, updatedChat), { chatRoom: {
                            id: null,
                            message: '채팅방 생성 중 오류가 발생했습니다. 채팅 목록에서 대화를 시작해보세요.'
                        } });
                }
            }
            return updatedChat;
        });
    },
    /**
     * 사용자의 커피챗 목록 조회
     *
     * @param userId - 사용자 ID
     * @param type - 조회 타입 ('requested': 신청한 것, 'received': 받은 것, undefined: 전체)
     * @returns 커피챗 목록
     */
    getCoffeeChats(userId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (type === 'requested') {
                return coffeechat_repository_1.default.getRequestedChats(userId);
            }
            else if (type === 'received') {
                return coffeechat_repository_1.default.getReceivedChats(userId);
            }
            else {
                return coffeechat_repository_1.default.getAllChats(userId);
            }
        });
    },
    /**
     * 커피챗 상세 정보 조회
     *
     * @param coffeeChatId - 커피챗 ID
     * @param userId - 조회하는 사용자 ID
     * @returns 커피챗 상세 정보
     * @throws {ServiceError} 존재하지 않음, 접근 권한 없음 등의 경우 에러 발생
     */
    getCoffeeChatDetail(coffeeChatId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const chat = yield this._getChatOrThrow(coffeeChatId);
            this._validateChatAccess(chat, userId);
            return chat;
        });
    },
    /**
     * 커피챗 신청 취소(삭제)
     *
     * @param coffeeChatId - 취소할 커피챗 ID
     * @param userId - 취소하는 사용자 ID (신청자만 가능)
     * @returns 취소된 커피챗 정보
     * @throws {ServiceError} 존재하지 않음, 권한 없음, 이미 처리됨 등의 경우 에러 발생
     */
    cancelCoffeeChat(coffeeChatId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const chat = yield this._getChatOrThrow(coffeeChatId);
            this._validateRequesterAccess(chat, userId);
            this._validateCancelable(chat);
            return coffeechat_repository_1.default.cancelCoffeeChat(coffeeChatId, userId);
        });
    },
};
exports.default = coffeechatService;

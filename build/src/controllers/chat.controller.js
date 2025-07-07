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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const chat_service_1 = require("../services/chat.service");
const ServiceError_1 = require("../utils/ServiceError");
class ChatController {
    constructor() {
        this.chatRoomService = new chat_service_1.ChatRoomService();
    }
    // 채팅방 생성 (이미 존재하면 기존 방 반환)
    createChatRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!currentUserId) {
                    return res.status(401).json({ message: '인증이 필요합니다.' });
                }
                const createChatRoomDto = req.body;
                const chatRoom = yield this.chatRoomService.createOrGetChatRoom(currentUserId, createChatRoomDto);
                return res.status(200).json({
                    success: true,
                    message: '채팅방을 조회했습니다.',
                    data: chatRoom
                });
            }
            catch (error) {
                if (error instanceof ServiceError_1.ServiceError) {
                    return res.status(error.status).json({
                        success: false,
                        message: error.message
                    });
                }
                console.error('채팅방 생성 오류:', error);
                return res.status(500).json({
                    success: false,
                    message: '채팅방 생성 중 오류가 발생했습니다.'
                });
            }
        });
    }
    // 사용자의 채팅방 목록 조회
    getChatRoomList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!currentUserId) {
                    return res.status(401).json({ message: '인증이 필요합니다.' });
                }
                const chatRoomList = yield this.chatRoomService.getChatRoomList(currentUserId);
                return res.status(200).json({
                    success: true,
                    message: '채팅방 목록을 조회했습니다.',
                    data: chatRoomList.chatRooms,
                    total: chatRoomList.total
                });
            }
            catch (error) {
                if (error instanceof ServiceError_1.ServiceError) {
                    return res.status(error.status).json({
                        success: false,
                        message: error.message
                    });
                }
                console.error('채팅방 목록 조회 오류:', error);
                return res.status(500).json({
                    success: false,
                    message: '채팅방 목록 조회 중 오류가 발생했습니다.'
                });
            }
        });
    }
    // 특정 채팅방 상세 정보 조회
    getChatRoomById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!currentUserId) {
                    return res.status(401).json({ message: '인증이 필요합니다.' });
                }
                const { chatRoomId } = req.params;
                if (!chatRoomId) {
                    return res.status(400).json({
                        success: false,
                        message: '채팅방 ID가 필요합니다.'
                    });
                }
                const chatRoom = yield this.chatRoomService.getChatRoomById(chatRoomId, currentUserId);
                return res.status(200).json({
                    success: true,
                    message: '채팅방 정보를 조회했습니다.',
                    data: chatRoom
                });
            }
            catch (error) {
                if (error instanceof ServiceError_1.ServiceError) {
                    return res.status(error.status).json({
                        success: false,
                        message: error.message
                    });
                }
                console.error('채팅방 조회 오류:', error);
                return res.status(500).json({
                    success: false,
                    message: '채팅방 조회 중 오류가 발생했습니다.'
                });
            }
        });
    }
    // 채팅방 나가기
    leaveChatRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!currentUserId) {
                    return res.status(401).json({ message: '인증이 필요합니다.' });
                }
                const { chatRoomId } = req.params;
                if (!chatRoomId) {
                    return res.status(400).json({
                        success: false,
                        message: '채팅방 ID가 필요합니다.'
                    });
                }
                yield this.chatRoomService.leaveChatRoom(chatRoomId, currentUserId);
                return res.status(200).json({
                    success: true,
                    message: '채팅방에서 나갔습니다.'
                });
            }
            catch (error) {
                if (error instanceof ServiceError_1.ServiceError) {
                    return res.status(error.status).json({
                        success: false,
                        message: error.message
                    });
                }
                console.error('채팅방 나가기 오류:', error);
                return res.status(500).json({
                    success: false,
                    message: '채팅방 나가기 중 오류가 발생했습니다.'
                });
            }
        });
    }
    // 캐시 통계 조회 (개발/디버깅용)
    getCacheStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chatRoomService = new chat_service_1.ChatRoomService();
                const stats = chatRoomService.getCacheStats();
                return res.status(200).json({
                    success: true,
                    message: '캐시 통계를 조회했습니다.',
                    data: stats
                });
            }
            catch (error) {
                console.error('캐시 통계 조회 오류:', error);
                return res.status(500).json({
                    success: false,
                    message: '캐시 통계 조회 중 오류가 발생했습니다.'
                });
            }
        });
    }
    // 캐시 수동 정리 (개발/디버깅용)
    cleanupCache(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chatRoomService = new chat_service_1.ChatRoomService();
                chatRoomService.cleanupExpiredCaches();
                return res.status(200).json({
                    success: true,
                    message: '캐시가 정리되었습니다.'
                });
            }
            catch (error) {
                console.error('캐시 정리 오류:', error);
                return res.status(500).json({
                    success: false,
                    message: '캐시 정리 중 오류가 발생했습니다.'
                });
            }
        });
    }
}
exports.ChatController = ChatController;

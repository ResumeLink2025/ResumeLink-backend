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
exports.default = createChatRouter;
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const message_controller_1 = require("../controllers/message.controller");
const middleware_auth_1 = require("../middlewares/middleware.auth");
const middleware_dto_1 = require("../middlewares/middleware.dto");
const middleware_upload_1 = require("../middlewares/middleware.upload");
const chat_dto_1 = require("../dtos/chat.dto");
const message_dto_1 = require("../dtos/message.dto");
// Socket.IO 인스턴스를 받는 팩토리 함수로 변경
function createChatRouter(io) {
    const router = (0, express_1.Router)();
    const chatController = new chat_controller_1.ChatController();
    const messageController = new message_controller_1.MessageController(io);
    // 모든 채팅 API는 인증 필요
    router.use(middleware_auth_1.authMiddleware);
    // 채팅방 생성 (커피챗 수락 시에만)
    router.post('/rooms', (0, middleware_dto_1.validateDto)(chat_dto_1.CreateChatRoomRequestDto), (req, res) => __awaiter(this, void 0, void 0, function* () {
        yield chatController.createChatRoom(req, res);
    }));
    // 사용자의 채팅방 목록 조회
    router.get('/rooms', (req, res) => __awaiter(this, void 0, void 0, function* () {
        yield chatController.getChatRoomList(req, res);
    }));
    // 특정 채팅방 상세 조회
    router.get('/rooms/:chatRoomId', (req, res) => __awaiter(this, void 0, void 0, function* () {
        yield chatController.getChatRoomById(req, res);
    }));
    // 채팅방 나가기
    router.delete('/rooms/:chatRoomId/participants', (req, res) => __awaiter(this, void 0, void 0, function* () {
        yield chatController.leaveChatRoom(req, res);
    }));
    // === 메시지 관련 라우트 ===
    // 텍스트 메시지 전송
    router.post('/rooms/:chatRoomId/messages', (0, middleware_dto_1.validateDto)(message_dto_1.SendMessageRequestDto), (req, res) => __awaiter(this, void 0, void 0, function* () {
        yield messageController.sendMessage(req, res);
    }));
    // 파일/이미지 메시지 전송
    router.post('/rooms/:chatRoomId/messages/file', middleware_upload_1.uploadMiddleware.single('file'), (req, res) => __awaiter(this, void 0, void 0, function* () {
        yield messageController.sendFileMessage(req, res);
    }));
    // 메시지 목록 조회 (페이지네이션 + 일괄 읽음 처리)
    router.get('/rooms/:chatRoomId/messages', (req, res) => __awaiter(this, void 0, void 0, function* () {
        yield messageController.getMessages(req, res);
    }));
    // 메시지 수정
    router.put('/messages/:messageId', (0, middleware_dto_1.validateDto)(message_dto_1.UpdateMessageRequestDto), (req, res) => __awaiter(this, void 0, void 0, function* () {
        yield messageController.updateMessage(req, res);
    }));
    // 메시지 삭제
    router.delete('/messages/:messageId', (req, res) => __awaiter(this, void 0, void 0, function* () {
        yield messageController.deleteMessage(req, res);
    }));
    // 미읽은 메시지 수 조회
    router.get('/rooms/:chatRoomId/unread-count', (req, res) => __awaiter(this, void 0, void 0, function* () {
        yield messageController.getUnreadCount(req, res);
    }));
    // 캐시 통계 조회 (개발/디버깅용)
    router.get('/cache/stats', (req, res) => __awaiter(this, void 0, void 0, function* () {
        yield chatController.getCacheStats(req, res);
    }));
    // 캐시 수동 정리 (개발/디버깅용)
    router.post('/cache/cleanup', (req, res) => __awaiter(this, void 0, void 0, function* () {
        yield chatController.cleanupCache(req, res);
    }));
    return router;
}

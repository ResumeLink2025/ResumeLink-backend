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
exports.MessageController = void 0;
const message_service_1 = require("../services/message.service");
const ServiceError_1 = require("../utils/ServiceError");
const middleware_upload_1 = require("../middlewares/middleware.upload");
class MessageController {
    constructor(io) {
        this.messageService = new message_service_1.MessageService();
        this.io = io;
    }
    // 메시지 전송
    sendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!currentUserId) {
                    return res.status(401).json({
                        success: false,
                        message: '인증이 필요합니다.'
                    });
                }
                const { chatRoomId } = req.params;
                if (!chatRoomId) {
                    return res.status(400).json({
                        success: false,
                        message: '채팅방 ID가 필요합니다.'
                    });
                }
                const sendMessageDto = req.body;
                const message = yield this.messageService.sendMessage(chatRoomId, currentUserId, sendMessageDto);
                return res.status(201).json({
                    success: true,
                    message: '메시지가 전송되었습니다.',
                    data: message
                });
            }
            catch (error) {
                if (error instanceof ServiceError_1.ServiceError) {
                    return res.status(error.status).json({
                        success: false,
                        message: error.message
                    });
                }
                console.error('메시지 전송 오류:', error);
                return res.status(500).json({
                    success: false,
                    message: '메시지 전송 중 오류가 발생했습니다.'
                });
            }
        });
    }
    // 파일 업로드와 함께 메시지 전송
    sendFileMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!currentUserId) {
                    return res.status(401).json({
                        success: false,
                        message: '인증이 필요합니다.'
                    });
                }
                const { chatRoomId } = req.params;
                if (!chatRoomId) {
                    return res.status(400).json({
                        success: false,
                        message: '채팅방 ID가 필요합니다.'
                    });
                }
                const file = req.file;
                if (!file) {
                    return res.status(400).json({
                        success: false,
                        message: '파일이 필요합니다.'
                    });
                }
                // 업로드된 파일 정보로 메시지 DTO 생성
                const sendMessageDto = {
                    text: req.body.text || '', // 선택적 텍스트 (파일과 함께 보낼 수 있음)
                    fileUrl: `/uploads/chat/${file.filename}`,
                    fileName: file.originalname,
                    fileSize: file.size,
                    messageType: (0, middleware_upload_1.getMessageType)(file.mimetype)
                };
                const message = yield this.messageService.sendMessage(chatRoomId, currentUserId, sendMessageDto);
                return res.status(201).json({
                    success: true,
                    message: '파일 메시지가 전송되었습니다.',
                    data: message
                });
            }
            catch (error) {
                if (error instanceof ServiceError_1.ServiceError) {
                    return res.status(error.status).json({
                        success: false,
                        message: error.message
                    });
                }
                console.error('파일 메시지 전송 오류:', error);
                return res.status(500).json({
                    success: false,
                    message: '파일 메시지 전송 중 오류가 발생했습니다.'
                });
            }
        });
    }
    // 메시지 목록 조회 (단순 데이터 반환만)
    getMessages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!currentUserId) {
                    return res.status(401).json({
                        success: false,
                        message: '인증이 필요합니다.'
                    });
                }
                const { chatRoomId } = req.params;
                if (!chatRoomId) {
                    return res.status(400).json({
                        success: false,
                        message: '채팅방 ID가 필요합니다.'
                    });
                }
                const query = {
                    limit: req.query.limit ? parseInt(req.query.limit) : 20,
                    cursor: req.query.cursor,
                    direction: req.query.direction || 'before'
                };
                // 단순히 메시지만 조회 (읽음 처리 제거)
                const messageList = yield this.messageService.getMessages(chatRoomId, currentUserId, query);
                return res.status(200).json({
                    success: true,
                    message: '메시지 목록을 조회했습니다.',
                    data: messageList
                });
            }
            catch (error) {
                if (error instanceof ServiceError_1.ServiceError) {
                    return res.status(error.status).json({
                        success: false,
                        message: error.message
                    });
                }
                console.error('메시지 목록 조회 오류:', error);
                return res.status(500).json({
                    success: false,
                    message: '메시지 목록 조회 중 오류가 발생했습니다.'
                });
            }
        });
    }
    // 메시지 수정
    updateMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!currentUserId) {
                    return res.status(401).json({
                        success: false,
                        message: '인증이 필요합니다.'
                    });
                }
                const { messageId } = req.params;
                if (!messageId) {
                    return res.status(400).json({
                        success: false,
                        message: '메시지 ID가 필요합니다.'
                    });
                }
                const updateMessageDto = req.body;
                const updatedMessage = yield this.messageService.updateMessage(messageId, currentUserId, updateMessageDto);
                return res.status(200).json({
                    success: true,
                    message: '메시지가 수정되었습니다.',
                    data: updatedMessage
                });
            }
            catch (error) {
                if (error instanceof ServiceError_1.ServiceError) {
                    return res.status(error.status).json({
                        success: false,
                        message: error.message
                    });
                }
                console.error('메시지 수정 오류:', error);
                return res.status(500).json({
                    success: false,
                    message: '메시지 수정 중 오류가 발생했습니다.'
                });
            }
        });
    }
    // 메시지 삭제
    deleteMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!currentUserId) {
                    return res.status(401).json({
                        success: false,
                        message: '인증이 필요합니다.'
                    });
                }
                const { messageId } = req.params;
                if (!messageId) {
                    return res.status(400).json({
                        success: false,
                        message: '메시지 ID가 필요합니다.'
                    });
                }
                yield this.messageService.deleteMessage(messageId, currentUserId);
                return res.status(200).json({
                    success: true,
                    message: '메시지가 삭제되었습니다.'
                });
            }
            catch (error) {
                if (error instanceof ServiceError_1.ServiceError) {
                    return res.status(error.status).json({
                        success: false,
                        message: error.message
                    });
                }
                console.error('메시지 삭제 오류:', error);
                return res.status(500).json({
                    success: false,
                    message: '메시지 삭제 중 오류가 발생했습니다.'
                });
            }
        });
    }
    // 미읽은 메시지 수 조회
    getUnreadCount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!currentUserId) {
                    return res.status(401).json({
                        success: false,
                        message: '인증이 필요합니다.'
                    });
                }
                const { chatRoomId } = req.params;
                if (!chatRoomId) {
                    return res.status(400).json({
                        success: false,
                        message: '채팅방 ID가 필요합니다.'
                    });
                }
                const unreadCount = yield this.messageService.getUnreadMessageCount(chatRoomId, currentUserId);
                return res.status(200).json({
                    success: true,
                    message: '미읽은 메시지 수를 조회했습니다.',
                    data: { unreadCount }
                });
            }
            catch (error) {
                if (error instanceof ServiceError_1.ServiceError) {
                    return res.status(error.status).json({
                        success: false,
                        message: error.message
                    });
                }
                console.error('미읽은 메시지 수 조회 오류:', error);
                return res.status(500).json({
                    success: false,
                    message: '미읽은 메시지 수 조회 중 오류가 발생했습니다.'
                });
            }
        });
    }
}
exports.MessageController = MessageController;

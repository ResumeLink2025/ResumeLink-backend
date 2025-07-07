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
exports.getUserRooms = exports.getRoomUsers = exports.setupSocketHandlers = void 0;
const middleware_socket_1 = require("../middlewares/middleware.socket");
const chat_service_1 = require("../services/chat.service");
const message_service_1 = require("../services/message.service");
const ServiceError_1 = require("../utils/ServiceError");
/**
 * Socket.IO 이벤트 핸들러 설정
 * - 기본 연결/해제 이벤트
 * - 채팅방 입장/나가기 이벤트
 * - 에러 처리 및 로그 출력
 */
// 연결된 사용자 관리 (메모리 기반, 추후 Redis로 확장 가능)
const connectedUsers = new Map();
// 채팅방별 사용자 관리 (roomId -> Set<userId>)
const roomUsers = new Map();
// 사용자별 참여 중인 채팅방 관리 (userId -> Set<roomId>)
const userRooms = new Map();
// 서비스 인스턴스
const chatService = new chat_service_1.ChatRoomService();
const messageService = new message_service_1.MessageService();
/**
 * Socket.IO 서버 설정 및 이벤트 핸들러 등록
 * @param io Socket.IO 서버 인스턴스
 */
const setupSocketHandlers = (io) => {
    // 인증 미들웨어 등록
    io.use(middleware_socket_1.socketAuthMiddleware);
    // 연결 이벤트 처리
    io.on('connection', (socket) => {
        var _a;
        console.log(`[Socket] 새 연결: ${(_a = socket.user) === null || _a === void 0 ? void 0 : _a.nickname} (${socket.id})`);
        // 연결된 사용자 목록에 추가
        if (socket.userId) {
            connectedUsers.set(socket.userId, socket);
            // 사용자가 이미 참여 중인 채팅방들에 다시 입장 처리
            const userJoinedRooms = userRooms.get(socket.userId);
            if (userJoinedRooms) {
                userJoinedRooms.forEach(roomId => {
                    socket.join(roomId);
                });
            }
        }
        // 연결 확인 이벤트 (클라이언트에서 연결 상태 확인용)
        socket.emit('connected', {
            message: '실시간 채팅 서버에 연결되었습니다.',
            userId: socket.userId,
            user: socket.user,
            timestamp: new Date().toISOString(),
        });
        // === 채팅방 입장 이벤트 ===
        socket.on('room:join', (data, callback) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield handleRoomJoin(socket, data);
                callback(response);
            }
            catch (error) {
                const errorResponse = {
                    success: false,
                    error: {
                        message: error instanceof ServiceError_1.ServiceError ? error.message : '채팅방 입장 중 오류가 발생했습니다.',
                        code: error instanceof ServiceError_1.ServiceError ? error.status.toString() : 'INTERNAL_ERROR'
                    },
                    timestamp: new Date().toISOString()
                };
                callback(errorResponse);
                console.error(`[Socket] 채팅방 입장 실패 (${(_a = socket.user) === null || _a === void 0 ? void 0 : _a.nickname}):`, error);
            }
        }));
        // === 채팅방 나가기 이벤트 ===
        socket.on('room:leave', (data, callback) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield handleRoomLeave(socket, data);
                callback(response);
            }
            catch (error) {
                const errorResponse = {
                    success: false,
                    error: {
                        message: error instanceof ServiceError_1.ServiceError ? error.message : '채팅방 나가기 중 오류가 발생했습니다.',
                        code: error instanceof ServiceError_1.ServiceError ? error.status.toString() : 'INTERNAL_ERROR'
                    },
                    timestamp: new Date().toISOString()
                };
                callback(errorResponse);
                console.error(`[Socket] 채팅방 나가기 실패 (${(_a = socket.user) === null || _a === void 0 ? void 0 : _a.nickname}):`, error);
            }
        }));
        // === 메시지 송수신 이벤트 ===
        socket.on('message:send', (data, callback) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield handleMessageSend(socket, data);
                callback === null || callback === void 0 ? void 0 : callback(response);
            }
            catch (error) {
                const errorResponse = {
                    success: false,
                    error: {
                        message: error instanceof ServiceError_1.ServiceError ? error.message : '메시지 전송 중 오류가 발생했습니다.',
                        code: error instanceof ServiceError_1.ServiceError ? error.status.toString() : 'INTERNAL_ERROR'
                    },
                    timestamp: new Date().toISOString()
                };
                callback === null || callback === void 0 ? void 0 : callback(errorResponse);
                // 메시지 전송 실패 알림
                const failureNotification = {
                    chatRoomId: data.chatRoomId,
                    error: {
                        message: error instanceof ServiceError_1.ServiceError ? error.message : '메시지 전송에 실패했습니다.',
                        code: error instanceof ServiceError_1.ServiceError ? error.status.toString() : 'INTERNAL_ERROR'
                    },
                    timestamp: new Date().toISOString()
                };
                socket.emit('message:send_failed', failureNotification);
                console.error(`[Socket] 메시지 전송 실패 (${(_a = socket.user) === null || _a === void 0 ? void 0 : _a.nickname}):`, error);
            }
        }));
        // 연결 해제 이벤트 (임시 세션 종료만)
        socket.on('disconnect', (reason) => {
            var _a;
            console.log(`[Socket] 연결 해제: ${(_a = socket.user) === null || _a === void 0 ? void 0 : _a.nickname} (${socket.id}) - ${reason}`);
            if (socket.userId) {
                // 연결된 사용자 목록에서 제거
                connectedUsers.delete(socket.userId);
                // 현재 세션에서만 채팅방 나가기 (영구 퇴장 아님)
                const userJoinedRooms = userRooms.get(socket.userId);
                if (userJoinedRooms) {
                    userJoinedRooms.forEach(roomId => {
                        // Socket.IO 방에서만 나가기 (DB는 건드리지 않음)
                        socket.leave(roomId);
                        removeUserFromCurrentSession(socket.userId, roomId);
                    });
                }
            }
        });
        // 에러 이벤트 처리
        socket.on('error', (error) => {
            var _a;
            console.error(`[Socket Error] ${(_a = socket.user) === null || _a === void 0 ? void 0 : _a.nickname} (${socket.id}):`, error);
        });
        // 연결 상태 확인 (ping-pong)
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: new Date().toISOString() });
        });
    });
    // 인증 에러 처리
    io.engine.on('connection_error', (err) => {
        console.error('[Socket Connection Error]:', err.message);
    });
};
exports.setupSocketHandlers = setupSocketHandlers;
/**
 * 채팅방 입장 처리
 */
function handleRoomJoin(socket, data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const { chatRoomId } = data;
        const userId = socket.userId;
        // 채팅방 참여 권한 확인
        const chatRoom = yield chatService.getChatRoomById(chatRoomId, userId.toString());
        // Socket.IO 방에 입장
        socket.join(chatRoomId);
        // 메모리에 사용자-방 매핑 추가
        addUserToRoom(userId, chatRoomId);
        // 채팅방 입장과 동시에 미읽은 메시지 읽음 처리
        try {
            const readResult = yield messageService.markAllUnreadMessagesAsRead(chatRoomId, userId.toString());
            // 읽은 메시지가 있다면 상대방에게 간단한 읽음 상태 업데이트만 전송
            // 카카오톡처럼 "1" 표시가 사라지도록 하는 용도
            if (readResult.readCount > 0) {
                const readNotification = {
                    chatRoomId,
                    readByUserId: userId,
                    lastReadMessageId: readResult.lastReadMessageId
                };
                // 상대방에게만 읽음 상태 업데이트 알림 (UI 뱃지 제거용)
                socket.to(chatRoomId).emit('message:read', readNotification);
                console.log(`[Socket] 미읽은 메시지 읽음 처리: ${(_a = socket.user) === null || _a === void 0 ? void 0 : _a.nickname}, 읽은 수: ${readResult.readCount}`);
            }
        }
        catch (error) {
            console.error(`[Socket] 읽음 처리 실패:`, error);
            // 읽음 처리 실패해도 입장은 성공시킴
        }
        // 방의 다른 참여자들에게 입장 알림
        const joinNotification = {
            chatRoomId,
            user: {
                userId,
                nickname: socket.user.nickname
            },
            timestamp: new Date().toISOString()
        };
        socket.to(chatRoomId).emit('room:user_joined', joinNotification);
        // 현재 참여자 목록 구성
        const participants = chatRoom.participants.map(p => {
            var _a, _b;
            return ({
                userId: p.userId,
                nickname: ((_b = (_a = p.user) === null || _a === void 0 ? void 0 : _a.profile) === null || _b === void 0 ? void 0 : _b.nickname) || 'Unknown'
            });
        });
        // 성공 응답
        const response = {
            success: true,
            data: {
                chatRoomId,
                participants
            },
            timestamp: new Date().toISOString()
        };
        // 본인에게 입장 확인 알림
        const selfNotification = {
            chatRoomId,
            participants,
            timestamp: new Date().toISOString()
        };
        socket.emit('room:joined', selfNotification);
        console.log(`[Socket] 채팅방 입장: ${(_b = socket.user) === null || _b === void 0 ? void 0 : _b.nickname} -> ${chatRoomId}`);
        return response;
    });
}
/**
 * 채팅방 영구 나가기 처리 (소프트 삭제)
 */
function handleRoomLeave(socket, data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { chatRoomId } = data;
        const userId = socket.userId;
        // 1. 채팅방 참여 여부 확인
        const chatRoom = yield chatService.getChatRoomById(chatRoomId, userId.toString());
        if (!chatRoom) {
            throw new ServiceError_1.ServiceError(404, '채팅방을 찾을 수 없습니다.');
        }
        // 2. DB에서 소프트 삭제 (leftAt 컬럼 업데이트)
        try {
            yield chatService.leaveChatRoom(chatRoomId, userId.toString());
            console.log(`[Socket] 채팅방 영구 나가기 (소프트 삭제): ${(_a = socket.user) === null || _a === void 0 ? void 0 : _a.nickname} <- ${chatRoomId}`);
        }
        catch (error) {
            console.error(`[Socket] 채팅방 나가기 DB 처리 실패:`, error);
            throw new ServiceError_1.ServiceError(500, '채팅방 나가기 처리에 실패했습니다.');
        }
        // 3. Socket.IO 방에서 나가기 (현재 세션)
        socket.leave(chatRoomId);
        // 4. 메모리에서 영구 제거 (영구 퇴장이므로)
        removeUserFromRoom(userId, chatRoomId);
        // 5. 다른 참여자들에게 나가기 알림 (상대방이 메시지 전송 불가하도록)
        const leaveNotification = {
            chatRoomId,
            user: {
                userId,
                nickname: socket.user.nickname
            },
            timestamp: new Date().toISOString()
        };
        socket.to(chatRoomId).emit('room:user_left', leaveNotification);
        // 6. 성공 응답
        const response = {
            success: true,
            data: {
                chatRoomId,
                message: '채팅방에서 나갔습니다.'
            },
            timestamp: new Date().toISOString()
        };
        // 7. 본인에게 나가기 확인 알림
        const selfNotification = {
            chatRoomId,
            message: '채팅방에서 나갔습니다.',
            timestamp: new Date().toISOString()
        };
        socket.emit('room:left', selfNotification);
        return response;
    });
}
/**
 * 사용자를 채팅방에 추가
 */
function addUserToRoom(userId, roomId) {
    // 방별 사용자 목록에 추가
    if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Set());
    }
    roomUsers.get(roomId).add(userId);
    // 사용자별 방 목록에 추가
    if (!userRooms.has(userId)) {
        userRooms.set(userId, new Set());
    }
    userRooms.get(userId).add(roomId);
}
/**
 * 사용자를 채팅방에서 제거 (영구 퇴장용)
 */
function removeUserFromRoom(userId, roomId) {
    // 방별 사용자 목록에서 제거
    const roomUserSet = roomUsers.get(roomId);
    if (roomUserSet) {
        roomUserSet.delete(userId);
        if (roomUserSet.size === 0) {
            roomUsers.delete(roomId);
        }
    }
    // 사용자별 방 목록에서 제거
    const userRoomSet = userRooms.get(userId);
    if (userRoomSet) {
        userRoomSet.delete(roomId);
        if (userRoomSet.size === 0) {
            userRooms.delete(userId);
        }
    }
}
/**
 * 현재 세션에서만 사용자를 채팅방에서 제거 (임시 연결 해제용)
 * 재연결 시 자동 입장을 위해 메모리는 유지하고 Socket.IO 방에서만 나감
 */
function removeUserFromCurrentSession(userId, roomId) {
    // 임시 연결 해제시에는 메모리 매핑을 유지함
    // Socket.IO 방에서의 leave는 disconnect 이벤트에서 자동 처리됨
    console.log(`[Socket] 임시 세션 종료: ${userId} <- ${roomId} (메모리 유지)`);
}
/**
 * 사용자가 특정 채팅방에 참여 중인지 확인
 */
function isUserInRoom(userId, roomId) {
    const userRoomSet = userRooms.get(userId);
    return userRoomSet ? userRoomSet.has(roomId) : false;
}
/**
 * 채팅방의 참여자 목록 조회
 */
const getRoomUsers = (roomId) => {
    const roomUserSet = roomUsers.get(roomId);
    return roomUserSet ? Array.from(roomUserSet) : [];
};
exports.getRoomUsers = getRoomUsers;
/**
 * 사용자가 참여 중인 채팅방 목록 조회
 */
const getUserRooms = (userId) => {
    const userRoomSet = userRooms.get(userId);
    return userRoomSet ? Array.from(userRoomSet) : [];
};
exports.getUserRooms = getUserRooms;
/**
 * 메시지 전송 처리
 */
function handleMessageSend(socket, data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { chatRoomId, content, messageType = 'TEXT', fileUrl, fileName, fileSize } = data;
        const userId = socket.userId;
        // 1. 입력 데이터 검증
        if (messageType === 'TEXT' && !(content === null || content === void 0 ? void 0 : content.trim())) {
            throw new ServiceError_1.ServiceError(400, '텍스트 메시지의 내용은 필수입니다.');
        }
        if ((messageType === 'IMAGE' || messageType === 'FILE') && !fileUrl) {
            throw new ServiceError_1.ServiceError(400, '파일 메시지는 파일 URL이 필수입니다.');
        }
        // 2. 채팅방 참여 권한 확인
        const chatRoom = yield chatService.getChatRoomById(chatRoomId, userId.toString());
        // 상대방이 채팅방을 나갔는지 확인
        const activeParticipants = chatRoom.participants.filter(p => p.leftAt === null);
        if (activeParticipants.length < 2) {
            throw new ServiceError_1.ServiceError(400, '상대방이 채팅방을 나가서 메시지를 보낼 수 없습니다.');
        }
        // 3. 메시지 저장
        const savedMessage = yield messageService.sendMessage(chatRoomId, userId.toString(), {
            text: (content === null || content === void 0 ? void 0 : content.trim()) || '',
            messageType: messageType, // 명시적 타입 캐스팅
            fileUrl,
            fileName,
            fileSize
        });
        // 4. 성공 응답 데이터 구성
        const messageResponse = {
            messageId: savedMessage.id,
            chatRoomId: savedMessage.chatRoomId,
            content: savedMessage.text || '',
            messageType: savedMessage.messageType,
            createdAt: savedMessage.createdAt,
            fileUrl: savedMessage.fileUrl || undefined,
            fileName: savedMessage.fileName || undefined,
            fileSize: savedMessage.fileSize || undefined,
            sender: {
                userId,
                nickname: socket.user.nickname
            }
        };
        // 5. 성공 응답
        const response = {
            success: true,
            data: messageResponse,
            timestamp: new Date().toISOString()
        };
        // 6. 단순화: 채팅방의 모든 소켓에 메시지 전송 (온라인/오프라인 구분 없음)
        const newMessageNotification = {
            messageId: savedMessage.id,
            chatRoomId: savedMessage.chatRoomId,
            content: savedMessage.text || '',
            messageType: savedMessage.messageType,
            createdAt: savedMessage.createdAt,
            fileUrl: savedMessage.fileUrl || undefined,
            fileName: savedMessage.fileName || undefined,
            fileSize: savedMessage.fileSize || undefined,
            sender: {
                userId,
                nickname: socket.user.nickname
            }
        };
        // 채팅방의 모든 소켓에 전송 (접속 중인 사람만 실시간으로 받음)
        socket.to(chatRoomId).emit('message:new', newMessageNotification);
        const displayContent = messageType === 'TEXT' ? content : `[${messageType}] ${fileName || 'file'}`;
        console.log(`[Socket] 메시지 전송: ${(_a = socket.user) === null || _a === void 0 ? void 0 : _a.nickname} -> ${chatRoomId}, 내용: ${displayContent === null || displayContent === void 0 ? void 0 : displayContent.substring(0, 50)}...`);
        return response;
    });
}

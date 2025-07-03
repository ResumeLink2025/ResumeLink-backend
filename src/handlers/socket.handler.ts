import { Server, Socket } from 'socket.io';
import { AuthenticatedSocket, socketAuthMiddleware } from '../middlewares/middleware.socket';
import { 
  JoinRoomRequest, 
  LeaveRoomRequest, 
  SocketResponse,
  RoomJoinedResponse,
  RoomLeftResponse,
  RoomJoinedNotification,
  RoomLeftNotification,
  UserJoinedRoomNotification,
  UserLeftRoomNotification,
  SendMessageRequest,
  MessageSentResponse,
  NewMessageNotification,
  MessageSendFailedNotification,
  MarkAsReadRequest,
  MessageReadNotification,
  ReadStatusUpdatedNotification
} from '../types/socket.types';
import { ChatRoomService } from '../services/chat.service';
import { MessageService } from '../services/message.service';
import { MessageType } from '../dtos/message.dto';
import { ServiceError } from '../utils/ServiceError';

/**
 * Socket.IO 이벤트 핸들러 설정
 * - 기본 연결/해제 이벤트
 * - 채팅방 입장/나가기 이벤트
 * - 에러 처리 및 로그 출력
 */

// 연결된 사용자 관리 (메모리 기반, 추후 Redis로 확장 가능)
const connectedUsers = new Map<number, AuthenticatedSocket>();

// 채팅방별 사용자 관리 (roomId -> Set<userId>)
const roomUsers = new Map<string, Set<number>>();

// 사용자별 참여 중인 채팅방 관리 (userId -> Set<roomId>)
const userRooms = new Map<number, Set<string>>();

// 서비스 인스턴스
const chatService = new ChatRoomService();
const messageService = new MessageService();

/**
 * Socket.IO 서버 설정 및 이벤트 핸들러 등록
 * @param io Socket.IO 서버 인스턴스
 */
export const setupSocketHandlers = (io: Server) => {
  // 인증 미들웨어 등록
  io.use(socketAuthMiddleware);

  // 연결 이벤트 처리
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`[Socket] 새 연결: ${socket.user?.nickname} (${socket.id})`);

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
    socket.on('room:join', async (data: JoinRoomRequest, callback) => {
      try {
        const response = await handleRoomJoin(socket, data);
        callback(response);
      } catch (error) {
        const errorResponse: SocketResponse<null> = {
          success: false,
          error: {
            message: error instanceof ServiceError ? error.message : '채팅방 입장 중 오류가 발생했습니다.',
            code: error instanceof ServiceError ? error.status.toString() : 'INTERNAL_ERROR'
          },
          timestamp: new Date().toISOString()
        };
        callback(errorResponse);
        console.error(`[Socket] 채팅방 입장 실패 (${socket.user?.nickname}):`, error);
      }
    });

    // === 채팅방 나가기 이벤트 ===
    socket.on('room:leave', async (data: LeaveRoomRequest, callback) => {
      try {
        const response = await handleRoomLeave(socket, data);
        callback(response);
      } catch (error) {
        const errorResponse: SocketResponse<null> = {
          success: false,
          error: {
            message: error instanceof ServiceError ? error.message : '채팅방 나가기 중 오류가 발생했습니다.',
            code: error instanceof ServiceError ? error.status.toString() : 'INTERNAL_ERROR'
          },
          timestamp: new Date().toISOString()
        };
        callback(errorResponse);
        console.error(`[Socket] 채팅방 나가기 실패 (${socket.user?.nickname}):`, error);
      }
    });

    // === 메시지 송수신 이벤트 ===
    socket.on('message:send', async (data: SendMessageRequest, callback) => {
      try {
        const response = await handleMessageSend(socket, data);
        callback?.(response);
      } catch (error) {
        const errorResponse: SocketResponse<null> = {
          success: false,
          error: {
            message: error instanceof ServiceError ? error.message : '메시지 전송 중 오류가 발생했습니다.',
            code: error instanceof ServiceError ? error.status.toString() : 'INTERNAL_ERROR'
          },
          timestamp: new Date().toISOString()
        };
        callback?.(errorResponse);
        
        // 메시지 전송 실패 알림
        const failureNotification: MessageSendFailedNotification = {
          chatRoomId: data.chatRoomId,
          error: {
            message: error instanceof ServiceError ? error.message : '메시지 전송에 실패했습니다.',
            code: error instanceof ServiceError ? error.status.toString() : 'INTERNAL_ERROR'
          },
          timestamp: new Date().toISOString()
        };
        
        socket.emit('message:send_failed', failureNotification);
        console.error(`[Socket] 메시지 전송 실패 (${socket.user?.nickname}):`, error);
      }
    });

    // === 메시지 읽음 상태 이벤트 ===
    socket.on('message:mark_read', async (data: MarkAsReadRequest, callback) => {
      try {
        const response = await handleMarkAsRead(socket, data);
        callback?.(response);
      } catch (error) {
        const errorResponse: SocketResponse<null> = {
          success: false,
          error: {
            message: error instanceof ServiceError ? error.message : '읽음 상태 업데이트 중 오류가 발생했습니다.',
            code: error instanceof ServiceError ? error.status.toString() : 'INTERNAL_ERROR'
          },
          timestamp: new Date().toISOString()
        };
        callback?.(errorResponse);
        console.error(`[Socket] 읽음 상태 업데이트 실패 (${socket.user?.nickname}):`, error);
      }
    });

    // 연결 해제 이벤트
    socket.on('disconnect', (reason) => {
      console.log(`[Socket] 연결 해제: ${socket.user?.nickname} (${socket.id}) - ${reason}`);
      
      if (socket.userId) {
        // 연결된 사용자 목록에서 제거
        connectedUsers.delete(socket.userId);
        
        // 참여 중인 모든 채팅방에서 나가기 처리
        const userJoinedRooms = userRooms.get(socket.userId);
        if (userJoinedRooms) {
          userJoinedRooms.forEach(roomId => {
            handleUserDisconnectFromRoom(socket, roomId);
          });
        }
      }
    });

    // 에러 이벤트 처리
    socket.on('error', (error) => {
      console.error(`[Socket Error] ${socket.user?.nickname} (${socket.id}):`, error);
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

/**
 * 채팅방 입장 처리
 */
async function handleRoomJoin(socket: AuthenticatedSocket, data: JoinRoomRequest): Promise<SocketResponse<RoomJoinedResponse>> {
  const { chatRoomId } = data;
  const userId = socket.userId!;

  // 채팅방 참여 권한 확인
  const chatRoom = await chatService.getChatRoomById(userId.toString(), chatRoomId);
  
  // Socket.IO 방에 입장
  socket.join(chatRoomId);
  
  // 메모리에 사용자-방 매핑 추가
  addUserToRoom(userId, chatRoomId);
  
  // 방의 다른 참여자들에게 입장 알림
  const joinNotification: UserJoinedRoomNotification = {
    chatRoomId,
    user: {
      userId,
      nickname: socket.user!.nickname
    },
    timestamp: new Date().toISOString()
  };
  
  socket.to(chatRoomId).emit('room:user_joined', joinNotification);
  
  // 현재 참여자 목록 구성
  const participants = chatRoom.participants.map(p => ({
    userId: parseInt(p.userId),
    nickname: p.user?.profile?.nickname || 'Unknown',
    isOnline: isUserOnline(parseInt(p.userId))
  }));
  
  // 성공 응답
  const response: SocketResponse<RoomJoinedResponse> = {
    success: true,
    data: {
      chatRoomId,
      participants
    },
    timestamp: new Date().toISOString()
  };
  
  // 본인에게 입장 확인 알림
  const selfNotification: RoomJoinedNotification = {
    chatRoomId,
    participants,
    timestamp: new Date().toISOString()
  };
  
  socket.emit('room:joined', selfNotification);
  
  console.log(`[Socket] 채팅방 입장: ${socket.user?.nickname} -> ${chatRoomId}`);
  
  return response;
}

/**
 * 채팅방 나가기 처리
 */
async function handleRoomLeave(socket: AuthenticatedSocket, data: LeaveRoomRequest): Promise<SocketResponse<RoomLeftResponse>> {
  const { chatRoomId } = data;
  const userId = socket.userId!;
  
  // 채팅방 참여 여부 확인
  if (!isUserInRoom(userId, chatRoomId)) {
    throw new ServiceError(400, '참여하지 않은 채팅방입니다.');
  }
  
  // Socket.IO 방에서 나가기
  socket.leave(chatRoomId);
  
  // 메모리에서 사용자-방 매핑 제거
  removeUserFromRoom(userId, chatRoomId);
  
  // 방의 다른 참여자들에게 나가기 알림
  const leaveNotification: UserLeftRoomNotification = {
    chatRoomId,
    user: {
      userId,
      nickname: socket.user!.nickname
    },
    timestamp: new Date().toISOString()
  };
  
  socket.to(chatRoomId).emit('room:user_left', leaveNotification);
  
  // 성공 응답
  const response: SocketResponse<RoomLeftResponse> = {
    success: true,
    data: {
      chatRoomId,
      message: '채팅방에서 나갔습니다.'
    },
    timestamp: new Date().toISOString()
  };
  
  // 본인에게 나가기 확인 알림
  const selfNotification: RoomLeftNotification = {
    chatRoomId,
    message: '채팅방에서 나갔습니다.',
    timestamp: new Date().toISOString()
  };
  
  socket.emit('room:left', selfNotification);
  
  console.log(`[Socket] 채팅방 나가기: ${socket.user?.nickname} <- ${chatRoomId}`);
  
  return response;
}

/**
 * 연결 해제 시 방에서 나가기 처리
 */
function handleUserDisconnectFromRoom(socket: AuthenticatedSocket, roomId: string): void {
  const userId = socket.userId!;
  
  // Socket.IO 방에서 나가기
  socket.leave(roomId);
  
  // 메모리에서 사용자-방 매핑 제거
  removeUserFromRoom(userId, roomId);
  
  // 다른 참여자들에게 나가기 알림
  const leaveNotification: UserLeftRoomNotification = {
    chatRoomId: roomId,
    user: {
      userId,
      nickname: socket.user!.nickname
    },
    timestamp: new Date().toISOString()
  };
  
  socket.to(roomId).emit('room:user_left', leaveNotification);
  
  console.log(`[Socket] 연결 해제로 인한 채팅방 나가기: ${socket.user?.nickname} <- ${roomId}`);
}

/**
 * 사용자를 채팅방에 추가
 */
function addUserToRoom(userId: number, roomId: string): void {
  // 방별 사용자 목록에 추가
  if (!roomUsers.has(roomId)) {
    roomUsers.set(roomId, new Set());
  }
  roomUsers.get(roomId)!.add(userId);
  
  // 사용자별 방 목록에 추가
  if (!userRooms.has(userId)) {
    userRooms.set(userId, new Set());
  }
  userRooms.get(userId)!.add(roomId);
}

/**
 * 사용자를 채팅방에서 제거
 */
function removeUserFromRoom(userId: number, roomId: string): void {
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
 * 사용자가 특정 채팅방에 참여 중인지 확인
 */
function isUserInRoom(userId: number, roomId: string): boolean {
  const userRoomSet = userRooms.get(userId);
  return userRoomSet ? userRoomSet.has(roomId) : false;
}

/**
 * 채팅방의 참여자 목록 조회
 */
export const getRoomUsers = (roomId: string): number[] => {
  const roomUserSet = roomUsers.get(roomId);
  return roomUserSet ? Array.from(roomUserSet) : [];
};

/**
 * 사용자가 참여 중인 채팅방 목록 조회
 */
export const getUserRooms = (userId: number): string[] => {
  const userRoomSet = userRooms.get(userId);
  return userRoomSet ? Array.from(userRoomSet) : [];
};

/**
 * 사용자의 온라인 상태 확인
 */
function isUserOnline(userId: number): boolean {
  return connectedUsers.has(userId);
}

/**
 * 온라인 사용자 목록 조회
 */
export const getOnlineUsers = (): number[] => {
  return Array.from(connectedUsers.keys());
};

/**
 * 특정 사용자의 소켓 인스턴스 조회
 */
export const getUserSocket = (userId: number): AuthenticatedSocket | undefined => {
  return connectedUsers.get(userId);
};

/**
 * 메시지 전송 처리
 */
async function handleMessageSend(socket: AuthenticatedSocket, data: SendMessageRequest): Promise<SocketResponse<MessageSentResponse>> {
  const { chatRoomId, content, messageType = 'TEXT' } = data;
  const userId = socket.userId!;

  // 1. 입력 데이터 검증
  if (!content?.trim()) {
    throw new ServiceError(400, '메시지 내용은 필수입니다.');
  }

  // 2. 채팅방 참여 권한 확인
  const chatRoom = await chatService.getChatRoomById(chatRoomId, userId.toString());
  
  // 3. 메시지 저장
  const savedMessage = await messageService.sendMessage(chatRoomId, userId.toString(), {
    text: content.trim(),
    messageType: messageType as any // MessageType enum과 호환성을 위해 any 사용
  });

  // 4. 성공 응답 데이터 구성
  const messageResponse: MessageSentResponse = {
    messageId: savedMessage.id,
    chatRoomId: savedMessage.chatRoomId,
    content: savedMessage.text || '',
    messageType: savedMessage.messageType as 'TEXT' | 'IMAGE' | 'FILE',
    createdAt: savedMessage.createdAt,
    sender: {
      userId,
      nickname: socket.user!.nickname
    }
  };

  // 5. 성공 응답
  const response: SocketResponse<MessageSentResponse> = {
    success: true,
    data: messageResponse,
    timestamp: new Date().toISOString()
  };

  // 6. 채팅방의 다른 참여자들에게 새 메시지 브로드캐스트
  const newMessageNotification: NewMessageNotification = {
    messageId: savedMessage.id,
    chatRoomId: savedMessage.chatRoomId,
    content: savedMessage.text || '',
    messageType: savedMessage.messageType as 'TEXT' | 'IMAGE' | 'FILE',
    createdAt: savedMessage.createdAt,
    sender: {
      userId,
      nickname: socket.user!.nickname
    },
    unreadCount: 1 // 기본값, 추후 실제 계산 로직으로 변경
  };

  // 전송자를 제외한 채팅방의 다른 참여자들에게만 알림
  socket.to(chatRoomId).emit('message:new', newMessageNotification);

  console.log(`[Socket] 메시지 전송: ${socket.user?.nickname} -> ${chatRoomId}, 내용: ${content.substring(0, 50)}...`);

  return response;
}

/**
 * 메시지 읽음 상태 처리
 * @param socket 인증된 소켓 연결
 * @param data 읽음 처리 요청 데이터
 * @returns 읽음 상태 업데이트 응답
 */
async function handleMarkAsRead(
  socket: AuthenticatedSocket, 
  data: MarkAsReadRequest
): Promise<SocketResponse<null>> {
  const { chatRoomId, messageId } = data;
  const userId = socket.userId!;

  console.log(`[Socket] 읽음 상태 처리: ${socket.user?.nickname} -> ${chatRoomId}, 메시지: ${messageId}`);

  // 1. 요청 데이터 검증
  if (!chatRoomId || !messageId) {
    throw new ServiceError(400, '채팅방 ID와 메시지 ID가 필요합니다.');
  }

  // 2. 메시지 읽음 상태 업데이트
  await messageService.markAsRead(chatRoomId, userId.toString(), messageId);

  // 3. 업데이트된 미읽은 메시지 수 계산
  const unreadCount = await messageService.getUnreadMessageCount(chatRoomId, userId.toString());

  // 4. 성공 응답
  const response: SocketResponse<null> = {
    success: true,
    data: null,
    timestamp: new Date().toISOString()
  };

  // 5. 읽음 상태 알림을 요청자에게 전송
  const readNotification: MessageReadNotification = {
    messageId,
    chatRoomId,
    readBy: {
      userId,
      nickname: socket.user!.nickname
    },
    readAt: new Date().toISOString(),
    unreadCount
  };

  socket.emit('message:read', readNotification);

  // 6. 읽음 상태 업데이트를 채팅방의 다른 참여자들에게 브로드캐스트
  const readStatusNotification: ReadStatusUpdatedNotification = {
    messageId,
    chatRoomId,
    readBy: {
      userId,
      nickname: socket.user!.nickname
    },
    readAt: new Date().toISOString()
  };

  // 읽음 처리한 사용자를 제외한 채팅방의 다른 참여자들에게만 알림
  socket.to(chatRoomId).emit('message:read_status_updated', readStatusNotification);

  console.log(`[Socket] 읽음 상태 완료: ${socket.user?.nickname} -> ${chatRoomId}, 미읽음: ${unreadCount}`);

  return response;
}

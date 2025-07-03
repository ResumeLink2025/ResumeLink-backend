import { Server, Socket } from 'socket.io';
import { AuthenticatedSocket, socketAuthMiddleware } from '../middlewares/middleware.socket';

/**
 * Socket.IO 이벤트 핸들러 설정
 * - 기본 연결/해제 이벤트
 * - 에러 처리
 * - 로그 출력
 */

// 연결된 사용자 관리 (메모리 기반, 추후 Redis로 확장 가능)
const connectedUsers = new Map<number, AuthenticatedSocket>();

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
    }

    // 연결 확인 이벤트 (클라이언트에서 연결 상태 확인용)
    socket.emit('connected', {
      message: '실시간 채팅 서버에 연결되었습니다.',
      userId: socket.userId,
      user: socket.user,
      timestamp: new Date().toISOString(),
    });

    // 연결 해제 이벤트
    socket.on('disconnect', (reason) => {
      console.log(`[Socket] 연결 해제: ${socket.user?.nickname} (${socket.id}) - ${reason}`);
      
      // 연결된 사용자 목록에서 제거
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
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
 * 특정 사용자가 온라인인지 확인
 * @param userId 사용자 ID
 * @returns 온라인 여부
 */
export const isUserOnline = (userId: number): boolean => {
  return connectedUsers.has(userId);
};

/**
 * 특정 사용자에게 이벤트 전송
 * @param userId 사용자 ID
 * @param event 이벤트 이름
 * @param data 전송할 데이터
 * @returns 전송 성공 여부
 */
export const emitToUser = (userId: number, event: string, data: any): boolean => {
  const socket = connectedUsers.get(userId);
  if (socket) {
    socket.emit(event, data);
    return true;
  }
  return false;
};

/**
 * 여러 사용자에게 이벤트 전송
 * @param userIds 사용자 ID 배열
 * @param event 이벤트 이름
 * @param data 전송할 데이터
 * @returns 전송 성공한 사용자 수
 */
export const emitToUsers = (userIds: number[], event: string, data: any): number => {
  let successCount = 0;
  userIds.forEach(userId => {
    if (emitToUser(userId, event, data)) {
      successCount++;
    }
  });
  return successCount;
};

/**
 * 현재 온라인 사용자 수 조회
 * @returns 온라인 사용자 수
 */
export const getOnlineUserCount = (): number => {
  return connectedUsers.size;
};

/**
 * 현재 온라인 사용자 ID 목록 조회
 * @returns 온라인 사용자 ID 배열
 */
export const getOnlineUserIds = (): number[] => {
  return Array.from(connectedUsers.keys());
};

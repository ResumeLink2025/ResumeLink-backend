import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import jwt from 'jsonwebtoken';

/**
 * Socket.IO 인증 미들웨어
 * - JWT 토큰 검증으로 WebSocket 연결 인증
 * - 인증된 사용자 정보를 socket 객체에 저장
 * - REST API와 동일한 인증 체계 사용
 */

interface AuthenticatedSocket extends Socket {
  userId?: number;
  user?: {
    id: number;
    email: string;
    name: string;
    nickname: string;
  };
}

/**
 * Socket.IO 인증 미들웨어
 * @param socket Socket.IO 소켓 객체
 * @param next 다음 미들웨어 호출 함수
 */
export const socketAuthMiddleware = (socket: AuthenticatedSocket, next: (err?: ExtendedError) => void) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    
    if (!token) {
      return next(new Error('인증 토큰이 필요합니다.'));
    }

    // Bearer 토큰 형식 처리
    const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    // JWT 토큰 검증
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new Error('서버 설정 오류: JWT_SECRET이 설정되지 않았습니다.'));
    }

    const decoded = jwt.verify(actualToken, secret) as any;
    
    if (!decoded || !decoded.id) {
      return next(new Error('유효하지 않은 토큰입니다.'));
    }

    // 소켓에 사용자 정보 저장
    socket.userId = decoded.id;
    socket.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      nickname: decoded.nickname,
    };

    console.log(`[Socket Auth] 사용자 연결됨: ${decoded.nickname || decoded.email} (ID: ${decoded.id})`);
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new Error('유효하지 않은 토큰입니다.'));
    } else if (error instanceof jwt.TokenExpiredError) {
      return next(new Error('토큰이 만료되었습니다.'));
    } else {
      console.error('[Socket Auth Error]:', error);
      return next(new Error('인증 중 오류가 발생했습니다.'));
    }
  }
};

export { AuthenticatedSocket };

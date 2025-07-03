/**
 * Socket.IO 클라이언트 타입 정의
 * - 프론트엔드에서 사용할 이벤트 타입 정의
 * - TypeScript 타입 안전성 보장
 */

// 서버에서 클라이언트로 전송하는 이벤트
export interface ServerToClientEvents {
  // 연결 관련
  connected: (data: {
    message: string;
    userId: number;
    user: {
      id: number;
      email: string;
      name: string;
      nickname: string;
    };
    timestamp: string;
  }) => void;

  // 연결 상태 확인
  pong: (data: { timestamp: string }) => void;

  // 에러 이벤트
  error: (data: { message: string; code?: string }) => void;
}

// 클라이언트에서 서버로 전송하는 이벤트
export interface ClientToServerEvents {
  // 연결 상태 확인
  ping: () => void;
}

// 소켓 간 데이터 (현재는 사용하지 않음)
export interface InterServerEvents {}

// 소켓 데이터 (인증 정보 등)
export interface SocketData {
  userId: number;
  user: {
    id: number;
    email: string;
    name: string;
    nickname: string;
  };
}

/**
 * WebSocket 이벤트 응답 공통 타입
 */
export interface SocketResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  timestamp: string;
}

/**
 * WebSocket 에러 타입
 */
export interface SocketError {
  message: string;
  code?: string;
  details?: any;
}

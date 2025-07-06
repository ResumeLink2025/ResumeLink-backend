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
    userId: string;
    user: {
      id: string;
      email: string;
      name: string;
      nickname: string;
    };
    timestamp: string;
  }) => void;

  // 연결 상태 확인
  pong: (data: { timestamp: string }) => void;

  // 채팅방 입장/나가기 알림
  'room:joined': (data: RoomJoinedNotification) => void;
  'room:left': (data: RoomLeftNotification) => void;
  'room:user_joined': (data: UserJoinedRoomNotification) => void;
  'room:user_left': (data: UserLeftRoomNotification) => void;

  // 메시지 관련 이벤트
  'message:new': (data: NewMessageNotification) => void;
  'message:send_failed': (data: MessageSendFailedNotification) => void;

  // 읽음 상태 관련 이벤트 (간소화)
  'message:read': (data: MessageReadNotification) => void;

  // 에러 이벤트
  error: (data: { message: string; code?: string }) => void;
}

// 클라이언트에서 서버로 전송하는 이벤트
export interface ClientToServerEvents {
  // 연결 상태 확인
  ping: () => void;

  // 채팅방 입장/나가기
  'room:join': (data: JoinRoomRequest, callback: (response: SocketResponse<RoomJoinedResponse>) => void) => void;
  'room:leave': (data: LeaveRoomRequest, callback: (response: SocketResponse<RoomLeftResponse>) => void) => void;

  // 메시지 송수신
  'message:send': (data: SendMessageRequest, callback?: (response: MessageSentResponse | SocketResponse) => void) => void;
  'message:receive': (callback: (data: MessageReceivedResponse) => void) => void;
}

// 소켓 간 데이터 (현재는 사용하지 않음)
export interface InterServerEvents {}

// 소켓 데이터 (인증 정보 등)
export interface SocketData {
  userId: string;
  user: {
    id: string;
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

// === 채팅방 관련 타입 정의 ===

/**
 * 채팅방 입장 요청
 */
export interface JoinRoomRequest {
  chatRoomId: string;
}

/**
 * 채팅방 나가기 요청
 */
export interface LeaveRoomRequest {
  chatRoomId: string;
}

/**
 * 채팅방 입장 성공 응답
 */
export interface RoomJoinedResponse {
  chatRoomId: string;
  participants: {
    userId: string;
    nickname: string;
  }[];
}

/**
 * 채팅방 나가기 성공 응답
 */
export interface RoomLeftResponse {
  chatRoomId: string;
  message: string;
}

/**
 * 채팅방 입장 알림 (본인)
 */
export interface RoomJoinedNotification {
  chatRoomId: string;
  participants: {
    userId: string;
    nickname: string;
  }[];
  timestamp: string;
}

/**
 * 채팅방 나가기 알림 (본인)
 */
export interface RoomLeftNotification {
  chatRoomId: string;
  message: string;
  timestamp: string;
}

/**
 * 사용자 입장 알림 (상대방)
 */
export interface UserJoinedRoomNotification {
  chatRoomId: string;
  user: {
    userId: string;
    nickname: string;
  };
  timestamp: string;
}

/**
 * 사용자 나가기 알림 (상대방)
 */
export interface UserLeftRoomNotification {
  chatRoomId: string;
  user: {
    userId: string;
    nickname: string;
  };
  timestamp: string;
}

// === 메시지 송수신 관련 타입 ===

/**
 * 메시지 전송 요청
 */
export interface SendMessageRequest {
  chatRoomId: string;
  content: string;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

/**
 * 메시지 전송 응답
 */
export interface MessageSentResponse {
  messageId: string;
  chatRoomId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE';
  createdAt: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  sender: {
    userId: string;
    nickname: string;
  };
}

/**
 * 새 메시지 알림 (다른 참여자들에게)
 */
export interface NewMessageNotification {
  messageId: string;
  chatRoomId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE';
  createdAt: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  sender: {
    userId: string;
    nickname: string;
  };
}

/**
 * 메시지 수신 확인 응답
 */
export interface MessageReceivedResponse {
  messageId: string;
  chatRoomId: string;
  receivedAt: string;
}

/**
 * 메시지 전송 실패 알림
 */
export interface MessageSendFailedNotification {
  chatRoomId: string;
  tempMessageId?: string; // 클라이언트에서 생성한 임시 ID
  error: {
    message: string;
    code: string;
  };
  timestamp: string;
}

// === 읽음 상태 관련 타입 ===

/**
 * 메시지 읽음 알림 (간소화)
 * 상대방이 메시지를 읽었을 때 발송자에게만 알림
 * UI에서는 "1" 뱃지를 제거하는 용도로만 사용
 */
export interface MessageReadNotification {
  chatRoomId: string;
  readByUserId: string; // 메시지를 읽은 사용자 ID
  lastReadMessageId?: string; // 마지막으로 읽은 메시지 ID (optional)
}

// 채팅방 관련 타입 정의
export interface IChatRoomService {
  createOrGetChatRoom(currentUserId: string, participantId: string): Promise<any>;
  getChatRoomList(userId: string): Promise<any>;
  getChatRoomById(chatRoomId: string, userId: string): Promise<any>;
  leaveChatRoom(chatRoomId: string, userId: string): Promise<void>;
}

// 에러 타입
export class ChatRoomError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = 'ChatRoomError';
  }
}

export class ChatRoomNotFoundError extends ChatRoomError {
  constructor(message: string = '채팅방을 찾을 수 없습니다.') {
    super(message, 404);
    this.name = 'ChatRoomNotFoundError';
  }
}

export class ChatRoomAccessError extends ChatRoomError {
  constructor(message: string = '채팅방 접근 권한이 없습니다.') {
    super(message, 403);
    this.name = 'ChatRoomAccessError';
  }
}

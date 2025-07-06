import { ServiceError } from '../utils/ServiceError';

// 채팅방 관련 타입 정의
export interface IChatRoomService {
  createOrGetChatRoom(currentUserId: string, input: any): Promise<any>;
  getChatRoomList(userId: string): Promise<any>;
  getChatRoomById(chatRoomId: string, userId: string): Promise<any>;
  leaveChatRoom(chatRoomId: string, userId: string): Promise<void>;
}

// 채팅 도메인 전용 에러 관리
// 프로젝트 공통 ServiceError 클래스를 활용하여 채팅별 구체적인 에러 생성
export const ChatErrors = {
  ROOM_NOT_FOUND: (message = '채팅방을 찾을 수 없습니다.') => new ServiceError(404, message),
  ACCESS_DENIED: (message = '채팅방 접근 권한이 없습니다.') => new ServiceError(403, message),
  INVALID_PARTICIPANT: (message = '유효하지 않은 참여자입니다.') => new ServiceError(400, message),
  SELF_CHAT_NOT_ALLOWED: (message = '자기 자신과는 채팅할 수 없습니다.') => new ServiceError(400, message),
  PARTICIPANT_NOT_FOUND: (message = '참여자를 찾을 수 없습니다.') => new ServiceError(404, message),
  NO_ACCEPTED_COFFEECHAT: (message = '수락된 커피챗이 없습니다.') => new ServiceError(403, message),
} as const;

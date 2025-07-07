"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatErrors = void 0;
const ServiceError_1 = require("../utils/ServiceError");
// 채팅 도메인 전용 에러 관리
// 프로젝트 공통 ServiceError 클래스를 활용하여 채팅별 구체적인 에러 생성
exports.ChatErrors = {
    ROOM_NOT_FOUND: (message = '채팅방을 찾을 수 없습니다.') => new ServiceError_1.ServiceError(404, message),
    ACCESS_DENIED: (message = '채팅방 접근 권한이 없습니다.') => new ServiceError_1.ServiceError(403, message),
    INVALID_PARTICIPANT: (message = '유효하지 않은 참여자입니다.') => new ServiceError_1.ServiceError(400, message),
    SELF_CHAT_NOT_ALLOWED: (message = '자기 자신과는 채팅할 수 없습니다.') => new ServiceError_1.ServiceError(400, message),
    PARTICIPANT_NOT_FOUND: (message = '참여자를 찾을 수 없습니다.') => new ServiceError_1.ServiceError(404, message),
    NO_ACCEPTED_COFFEECHAT: (message = '수락된 커피챗이 없습니다.') => new ServiceError_1.ServiceError(403, message),
};

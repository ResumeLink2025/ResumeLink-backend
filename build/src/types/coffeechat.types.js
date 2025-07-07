"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoffeeChatErrors = void 0;
const ServiceError_1 = require("../utils/ServiceError");
// 커피챗 도메인 전용 에러 관리
exports.CoffeeChatErrors = {
    NOT_FOUND: (message = '커피챗을 찾을 수 없습니다.') => new ServiceError_1.ServiceError(404, message),
    ACCESS_DENIED: (message = '커피챗 접근 권한이 없습니다.') => new ServiceError_1.ServiceError(403, message),
    ALREADY_PROCESSED: (message = '이미 처리된 커피챗입니다.') => new ServiceError_1.ServiceError(400, message),
    DUPLICATE_REQUEST: (message = '이미 진행 중인 커피챗이 있습니다.') => new ServiceError_1.ServiceError(409, message),
    SELF_REQUEST_NOT_ALLOWED: (message = '자기 자신에게는 커피챗을 신청할 수 없습니다.') => new ServiceError_1.ServiceError(400, message),
    RECEIVER_ONLY: (message = '수락/거절은 받은 사람만 할 수 있습니다.') => new ServiceError_1.ServiceError(403, message),
    REQUESTER_ONLY: (message = '취소는 신청한 사람만 할 수 있습니다.') => new ServiceError_1.ServiceError(403, message),
    NOT_PENDING: (message = '대기 중인 커피챗만 처리할 수 있습니다.') => new ServiceError_1.ServiceError(400, message),
    INVALID_STATUS: (message = '유효하지 않은 상태입니다.') => new ServiceError_1.ServiceError(400, message),
};

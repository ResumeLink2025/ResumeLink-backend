"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceError = void 0;
class ServiceError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = 'ServiceError';
        // Error 클래스를 상속할 때 프로토타입 체인 복원
        Object.setPrototypeOf(this, ServiceError.prototype);
    }
}
exports.ServiceError = ServiceError;

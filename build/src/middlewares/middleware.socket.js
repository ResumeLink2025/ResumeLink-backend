"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Socket.IO 인증 미들웨어
 * @param socket Socket.IO 소켓 객체
 * @param next 다음 미들웨어 호출 함수
 */
const socketAuthMiddleware = (socket, next) => {
    var _a, _b;
    try {
        // Authorization 헤더에서 토큰 추출
        const token = ((_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.token) || ((_b = socket.handshake.headers) === null || _b === void 0 ? void 0 : _b.authorization);
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
        const decoded = jsonwebtoken_1.default.verify(actualToken, secret);
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
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new Error('유효하지 않은 토큰입니다.'));
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new Error('토큰이 만료되었습니다.'));
        }
        else {
            console.error('[Socket Auth Error]:', error);
            return next(new Error('인증 중 오류가 발생했습니다.'));
        }
    }
};
exports.socketAuthMiddleware = socketAuthMiddleware;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const socket_handler_1 = require("./handlers/socket.handler");
const cache_scheduler_1 = require("./utils/cache-scheduler");
const chat_repository_1 = require("./repositories/chat.repository");
const PORT = process.env.PORT || 8080; // 프론트엔드 설정에 맞춤 (.env.example의 NEXT_PUBLIC_API_URL 설정 참고)
/**
 * 서버 구조 설명:
 * - Express 앱을 HTTP 서버로 감싸서 REST API + WebSocket을 동시 지원
 * - 같은 포트(8080)에서 HTTP API와 실시간 채팅 서비스 제공
 * - Express: REST API 처리 (기존 기능 유지)
 * - Socket.IO: 실시간 채팅 기능 (새로 추가)
 */
// Socket.IO 서버 설정 (실시간 통신용)
const io = new socket_io_1.Server(undefined, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:5173'], // Next.js와 Vite 기본 포트
        credentials: true,
    },
});
exports.io = io;
// Socket.IO 인스턴스를 앱에 전달
const app = (0, app_1.default)(io);
// HTTP 서버 생성 (Express 앱을 감쌈)
const server = (0, http_1.createServer)(app);
// Socket.IO를 HTTP 서버에 연결
io.attach(server);
// WebSocket 이벤트 핸들러 연결
(0, socket_handler_1.setupSocketHandlers)(io);
// 캐시 스케줄러 설정
const chatRepository = new chat_repository_1.ChatRepository();
const cacheScheduler = new cache_scheduler_1.CacheScheduler(chatRepository);
server.listen(PORT, () => {
    console.log(`${PORT}번 포트에서 서버가 실행 중입니다.`);
    console.log(`REST API: http://localhost:${PORT}/api`);
    console.log(`WebSocket: ws://localhost:${PORT}`);
    // 캐시 스케줄러 시작
    cacheScheduler.startCleanupScheduler();
});
// 애플리케이션 종료 시 캐시 스케줄러 정리
process.on('SIGINT', () => {
    console.log('\n서버 종료 중...');
    cacheScheduler.stopCleanupScheduler();
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('\n서버 종료 중...');
    cacheScheduler.stopCleanupScheduler();
    process.exit(0);
});

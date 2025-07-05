import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config(); 
import { createServer } from 'http';
import { Server } from 'socket.io';
import createApp from './app';
import { setupSocketHandlers } from './handlers/socket.handler';
import { CacheScheduler } from './utils/cache-scheduler';
import { ChatRepository } from './repositories/chat.repository';

const PORT = process.env.PORT || 8080; // 프론트엔드 설정에 맞춤 (.env.example의 NEXT_PUBLIC_API_URL 설정 참고)

/**
 * 서버 구조 설명:
 * - Express 앱을 HTTP 서버로 감싸서 REST API + WebSocket을 동시 지원
 * - 같은 포트(8080)에서 HTTP API와 실시간 채팅 서비스 제공
 * - Express: REST API 처리 (기존 기능 유지)
 * - Socket.IO: 실시간 채팅 기능 (새로 추가)
 */

// Socket.IO 서버 설정 (실시간 통신용)
const io = new Server(undefined, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Next.js와 Vite 기본 포트
    credentials: true,
  },
});

// Socket.IO 인스턴스를 앱에 전달
const app = createApp(io);

// HTTP 서버 생성 (Express 앱을 감쌈)
const server = createServer(app);

// Socket.IO를 HTTP 서버에 연결
io.attach(server);

// WebSocket 이벤트 핸들러 연결
setupSocketHandlers(io);

// 캐시 스케줄러 설정
const chatRepository = new ChatRepository();
const cacheScheduler = new CacheScheduler(chatRepository);

// Socket.IO export (실시간 브로드캐스트용)
export { io };

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
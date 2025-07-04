import express from "express";
import cors from "cors";
import path from "path";
import { Server } from 'socket.io';
import createMainRouter from './routers';  // 팩토리 함수로 변경
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

// Socket.IO 인스턴스를 받는 팩토리 함수로 변경
export default function createApp(io?: Server) {
  const app = express();

  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());

  // 업로드된 파일에 대한 정적 파일 서빙
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Socket.IO 인스턴스를 라우터에 전달
  app.use('/api', createMainRouter(io));

  app.set("port", process.env.PORT || 3000);

  // 간단 테스트 엔드포인트
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });
  app.get('/test-route2', (req, res) => {
    res.send('This is a test endpoint.');
  });

  return app;
}
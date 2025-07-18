import express from "express";
import cors from "cors";
import path from "path";
import { Server } from 'socket.io';
import createMainRouter from './routers';  // 팩토리 함수로 변경
import authRouter from './routers/auth.router';
import resumeRouter from './routers/resume.router';
import projectRouter from './routers/project.router';
import profileRouter from './routers/profile.router';
import imageRouter from './routers/image.router';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { ALLOWED_ORIGINS } from './config/cors.config';

dotenv.config();

// Socket.IO 인스턴스를 받는 팩토리 함수로 변경
export default function createApp(io?: Server) {
  const app = express();

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman, curl 같은 origin 없는 요청 허용
      if (ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));

  app.use(express.json());
  app.use(cookieParser());
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Socket.IO 인스턴스를 라우터에 전달
  app.use('/api', createMainRouter(io));

  app.use('/api/auth', authRouter);
  app.use('/api/resumes', resumeRouter);
  app.use('/api/projects', projectRouter);
  app.use('/api/profiles', profileRouter);
  app.use('/api/images', imageRouter);

  app.set("port", process.env.PORT || 3000);

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  return app;
}

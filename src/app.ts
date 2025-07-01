import express from "express";
import cors from "cors";
import routers from './routers';  // index.ts로 통합 import
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// 라우터를 index.ts에서 가져와서 사용
app.use('/api', routers);

app.set("port", process.env.PORT || 3000);

// 간단 테스트 엔드포인트
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get('/test-route2', (req, res) => {
  res.send('This is a test endpoint.');
});

export default app;
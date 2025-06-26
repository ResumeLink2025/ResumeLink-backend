import express from "express";
import cors from "cors";
import authRouter from './routers/auth.router';
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

app.use('/api/auth', authRouter);

app.set("port", process.env.PORT || 3000);

app.get("/", (req, res) => {
  res.send("Hello World!");
});
// 테스트를 위한 간단한 새 엔드포인트 추가 (미사용 변수/경로 확인용)
app.get('/test-route2', (req, res) => {
  const unusedVariable = "이 변수는 사용되지 않습니다."; // 의도적으로 사용되지 않는 변수
  res.send('This is a test endpoint.');
});

export default app;

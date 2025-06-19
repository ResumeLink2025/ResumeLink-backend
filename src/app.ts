import express from "express";
import cors from "cors";
import userRouter from './routers/user.router';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/api/users', userRouter);

app.set("port", process.env.PORT || 3000);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
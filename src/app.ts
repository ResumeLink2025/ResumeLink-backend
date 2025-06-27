import express from "express";
import cors from "cors";
import userRouter from './routers/auth.router';
import resumeRoutes from "./routers/resume.router";
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

app.use('/api/users', userRouter);
app.use("/api/resumes", resumeRoutes);

app.set("port", process.env.PORT || 3000);

app.get("/", (req, res) => {
  res.send("Hello World!");
});


export default app;
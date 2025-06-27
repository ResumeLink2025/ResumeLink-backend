import express, { Request, Response, Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/middleware.auth';
import { CreateUserRequsetDto, AccessRefreshDto, LoginUserRequestDto, AuthCodeDto } from '../dtos/auth.dto'
import { validateDto } from '../middlewares/middleware.dto';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const authController = new AuthController();

// 이메일 기반
router.post('/register', validateDto(CreateUserRequsetDto), async (req: Request, res: Response) => {
  await authController.register(req, res);
});

router.post('/login/local', validateDto(LoginUserRequestDto), async (req: Request, res: Response) => {
  await authController.login(req, res);
});

// 구글 로그인 테스트용
router.get('/google', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

// 카카오 로그인 테스트
router.get('/kakao', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.KAKAO_CLIENT_ID!,
    redirect_uri: process.env.KAKAO_REDIRECT_URI!,
    response_type: 'code',
  });

  res.redirect(`https://kauth.kakao.com/oauth/authorize?${params.toString()}`);
});


router.get('/login/google', async (req: Request, res: Response) => {
  await authController.loginGoogle(req, res);
});


router.get('/login/kakao', async (req: Request, res: Response) => {
  await authController.loginKakao(req, res);
});

router.post('/refresh', async (req: Request, res: Response) => {
  await authController.refreshAccessToken(req, res);
});

/* 나중에 필요해지면 추가
router.post('/reset', async (req: Request, res: Response) => {
  await authController.requestPasswordReset(req, res);
});

router.post('/reset/:token', async (req: Request, res: Response) => {
  await authController.resetPassword(req, res);
});
*/

export default router;

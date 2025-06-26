import express, { Request, Response, Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/middleware.auth';

import { CreateUserRequsetDto, AccessRefreshDto, LoginUserRequestDto } from '../dtos/auth.dto'
import { validateDto } from '../middlewares/middleware.dto';

const router = Router();
const authController = new AuthController();

// 이메일 기반
router.post('/register', validateDto(CreateUserRequsetDto), async (req: Request, res: Response) => {
  await authController.register(req, res);
});

router.post('/login/local', validateDto(LoginUserRequestDto), async (req: Request, res: Response) => {
  await authController.login(req, res);
});

// Oauth 기반
router.post('/registerGoogle', validateDto(CreateUserRequsetDto), async (req: Request, res: Response) => {
  await authController.register(req, res);
});



router.post('/login/Google', validateDto(AccessRefreshDto) ,async (req: Request, res: Response) => {
  await authController.loginGoogle(req, res);
});

router.post('/login/Kakao/getToken', validateDto(AuthCodeDto) ,async (req: Request, res: Response) => {
  await authController.loginGoogle(req, res);
});

router.post('/login/Kakao/getToken', validateDto(AccessRefreshDto) ,async (req: Request, res: Response) => {
  await authController.loginGoogle(req, res);
});



router.post('/refresh', validateDto(AccessRefreshDto) ,async (req: Request, res: Response) => {
  await authController.refreshAccessToken(req, res);
});


router.post('/reset', async (req: Request, res: Response) => {
  await authController.requestPasswordReset(req, res);
});

router.post('/reset/:token', async (req: Request, res: Response) => {
  await authController.resetPassword(req, res);
});
export default router;

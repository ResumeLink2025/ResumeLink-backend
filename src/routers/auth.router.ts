import express, { Request, Response, Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/middleware.auth';

import { CreateUserRequsetDto, GoogleOAuthRequestDto, LoginUserRequestDto } from '../dtos/auth.dto'
import { validateDto } from '../middlewares/middleware.dto';

const router = Router();
const authController = new AuthController();

// 이메일 기반
router.post('/register', validateDto(CreateUserRequsetDto), async (req: Request, res: Response) => {
  await authController.register(req, res);
});

router.post('/login', validateDto(LoginUserRequestDto), async (req: Request, res: Response) => {
  await authController.login(req, res);
});

// Oauth 기반
router.post('/registerGoogle', validateDto(CreateUserRequsetDto), async (req: Request, res: Response) => {
  await authController.register(req, res);
});



router.post('/loginGoogle', validateDto(GoogleOAuthRequestDto) ,async (req: Request, res: Response) => {
  await authController.loginGoogle(req, res);
});


router.post('/refresh', async (req: Request, res: Response) => {
  await authController.refreshAccessToken(req, res);
});


router.post('/reset', async (req: Request, res: Response) => {
  await authController.requestPasswordReset(req, res);
});

router.post('/reset/:token', async (req: Request, res: Response) => {
  await authController.resetPassword(req, res);
});
export default router;

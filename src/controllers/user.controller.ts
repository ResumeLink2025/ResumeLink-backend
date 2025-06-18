import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { sendResetEmail } from '../utils/sendEmail';

const userService = new UserService();


export class UserController {
    private userService = new UserService();

    async register(req: Request, res: Response) {
    try {
        const { email, password, nickname } = req.body;

        if (!email || !password || !nickname) {
            return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
        }

            const user = await userService.registerUser({ email, password, nickname });

        return res.status(201).json({ message: '회원가입 성공', user });
    } catch (error: any) {
        if (error.message === '이미 존재하는 이메일입니다.') {
            return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message || '회원가입 실패' });
    }
  }
    async login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
        }

        const user = await this.userService.loginUser({ email, password});

        return res.status(200).json({ message: '로그인 성공', user });
    } catch (error: any) {
        if (error.message === '이메일 또는 비밀번호가 잘못되었습니다.') {
            return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message || '로그인 실패' });
    }
  }

   // 이메일로 링크 전송
  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const token = await userService.requestPasswordReset(email);

      const link = `http://localhost:3000/reset/${token}`;
      await sendResetEmail(email, link);

      return res.json({ message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.' });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  // 토큰 기반 비밀번호 변경
  async resetPassword(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      const result = await userService.resetPassword(token, newPassword);
      if (!result.success) {
        return res.status(result.status ?? 400).json({ message: result.message });
      }

      return res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getUserInfo(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: '인증 실패' });
      const result = await userService.getUserInfo(userId);
      if (!result.success) {
        return res.status(result.status ?? 400).json({ message: result.message });
      }

      return res.json({ nickname: result.nickname });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}

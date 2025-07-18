import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
//import { sendResetEmail } from '../utils/sendEmail';
import { CreateUserRequsetDto, AuthTokenResponseDto, LoginUserRequestDto, AccessRefreshDto, AuthCodeDto } from '../dtos/auth.dto';
import dotenv from 'dotenv';
import { plainToInstance } from 'class-transformer';
import { getKakaoTokens } from '../utils/kakao';

dotenv.config();


export class AuthController {
    private authService = new AuthService();

    // 이메일 기반 회원가입
    async register(req: Request, res: Response) {
      try {
          const createUserDto = req.body as CreateUserRequsetDto;
          const { userId, accessToken, refreshToken } = await this.authService.registerUser(createUserDto);

          res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 60 * 60 * 1000, // 7일
            path: '/',
          });

          return res.status(201).json({ message: '회원가입 성공', userId,accessToken });
          
      } catch (error: any) {
          if (error.message === '이미 존재하는 이메일입니다.') {
              return res.status(409).json({ message: error.message });
          }
          return res.status(500).json({ message: error.message || '회원가입 실패' });
      }
    }

    // 이메일 기반 로그인
    async login(req: Request, res: Response) {
      try {
          const { email, password } = req.body as LoginUserRequestDto;

          if (!email || !password) {
              return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
          }

          const { userId, accessToken, refreshToken } = await this.authService.loginUser({ email, password});

          // HttpOnly, Secure 쿠키로 refreshToken 설정
          res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
            path: '/',
          });

          return res.status(200).json({ message: '로그인 성공', userId, accessToken});
        
          } catch (error: unknown) {
              const message = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.';
              return res.status(401).json({ message });
            }
    }

  // 구글 OAuth 기반 로그인
  async loginGoogle(req: Request, res: Response) {
    const code = req.query.code as string;
    

    if (!code) return res.status(400).send('No code provided');

    try {
      const {userId, accessToken, refreshToken} = await this.authService.loginGoogle( { code } );
      console.log(userId)

      res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
          path: '/',
        });

      return res.redirect(`https://resumelink.co.kr/success?userId=${userId}&accessToken=${accessToken}`);

    } catch (e: any) {
      if (e.message == "존재하지 않는 유저입니다.") {
        return res.status(401).json({ message: e });
      }
      return res.status(401).json({ message: e });
    }
  }

  // 카카오 OAuth 기반 로그인
  async loginKakao(req: Request, res: Response) {
    try {
      const code = req.query.code as string;

      const {userId, accessToken, refreshToken} = await this.authService.loginKakao( { code } );

      res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
          path: '/',
        });

      return res.redirect(`https://resumelink.co.kr/success?userId=${userId}&accessToken=${accessToken}`);

        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.';
          return res.status(401).json({ message });
            }
    }


  async refreshAccessToken(req: Request, res: Response) {
      try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
          return res.status(400).json({ message: '리프레시 토큰이 필요합니다.' });
        }

        const newAccessToken = await this.authService.refreshAccessToken(refreshToken);

        return res.status(200).json({
          message: '액세스 토큰 재발급 성공',
          accessToken: newAccessToken,
        });
      } catch (error: any) {
        return res.status(401).json({ message: error.message || '토큰 재발급 실패' });
      }
    }

    /* 나중에 필요해지면 추가
   // 이메일로 링크 전송
  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const token = await this.authService.requestPasswordReset(email);

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

      const result = await this.authService.resetPassword(token, newPassword);
      if (!result.success) {
        return res.status(result.status ?? 400).json({ message: result.message });
      }

      return res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
    */
}

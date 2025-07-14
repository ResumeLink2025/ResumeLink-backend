"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class AuthController {
    constructor() {
        this.authService = new auth_service_1.AuthService();
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
    // 이메일 기반 회원가입
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const createUserDto = req.body;
                const { userId, accessToken, refreshToken } = yield this.authService.registerUser(createUserDto);
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 60 * 60 * 1000, // 7일
                    path: '/',
                });
                return res.status(201).json({ message: '회원가입 성공', userId, accessToken });
            }
            catch (error) {
                if (error.message === '이미 존재하는 이메일입니다.') {
                    return res.status(409).json({ message: error.message });
                }
                return res.status(500).json({ message: error.message || '회원가입 실패' });
            }
        });
    }
    // 이메일 기반 로그인
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
                }
                const { userId, accessToken, refreshToken } = yield this.authService.loginUser({ email, password });
                // HttpOnly, Secure 쿠키로 refreshToken 설정
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
                    path: '/',
                });
                return res.status(200).json({ message: '로그인 성공', userId, accessToken });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.';
                return res.status(401).json({ message });
            }
        });
    }
    // 구글 OAuth 기반 로그인
    loginGoogle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const code = req.query.code;
            if (!code)
                return res.status(400).send('No code provided');
            try {
                const { userId, accessToken, refreshToken } = yield this.authService.loginGoogle({ code });
                console.log(userId);
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
                    path: '/',
                });
                return res.redirect(`http://localhost:8080/success?userId=${userId}&accessToken=${accessToken}`);
            }
            catch (e) {
                if (e.message == "존재하지 않는 유저입니다.") {
                    return res.status(401).json({ message: e });
                }
                return res.status(401).json({ message: e });
            }
        });
    }
    // 카카오 OAuth 기반 로그인
    loginKakao(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const code = req.query.code;
                const { userId, accessToken, refreshToken } = yield this.authService.loginKakao({ code });
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
                    path: '/',
                });
                return res.redirect(`http://localhost:8080/success?userId=${userId}&accessToken=${accessToken}`);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.';
                return res.status(401).json({ message });
            }
        });
    }
    refreshAccessToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
                if (!refreshToken) {
                    return res.status(400).json({ message: '리프레시 토큰이 필요합니다.' });
                }
                const newAccessToken = yield this.authService.refreshAccessToken(refreshToken);
                return res.status(200).json({
                    message: '액세스 토큰 재발급 성공',
                    accessToken: newAccessToken,
                });
            }
            catch (error) {
                return res.status(401).json({ message: error.message || '토큰 재발급 실패' });
            }
        });
    }
}
exports.AuthController = AuthController;

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
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_dto_1 = require("../dtos/auth.dto");
const middleware_dto_1 = require("../middlewares/middleware.dto");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// 이메일 기반
router.post('/register', (0, middleware_dto_1.validateDto)(auth_dto_1.CreateUserRequsetDto), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield authController.register(req, res);
}));
router.post('/login/local', (0, middleware_dto_1.validateDto)(auth_dto_1.LoginUserRequestDto), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield authController.login(req, res);
}));
// 구글 로그인 테스트용
router.get('/google', (req, res) => {
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
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
        client_id: process.env.KAKAO_CLIENT_ID,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        response_type: 'code',
    });
    res.redirect(`https://kauth.kakao.com/oauth/authorize?${params.toString()}`);
});
router.get('/login/google', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield authController.loginGoogle(req, res);
}));
router.get('/login/kakao', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield authController.loginKakao(req, res);
}));
router.post('/refresh', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield authController.refreshAccessToken(req, res);
}));
/* 나중에 필요해지면 추가
router.post('/reset', async (req: Request, res: Response) => {
  await authController.requestPasswordReset(req, res);
});

router.post('/reset/:token', async (req: Request, res: Response) => {
  await authController.resetPassword(req, res);
});
*/
exports.default = router;

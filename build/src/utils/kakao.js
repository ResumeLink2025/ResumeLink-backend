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
exports.getKakaoTokens = getKakaoTokens;
exports.refreshKakaoAccessToken = refreshKakaoAccessToken;
exports.getKakaoUserInfo = getKakaoUserInfo;
exports.verifyKakaoRefreshToken = verifyKakaoRefreshToken;
const axios_1 = __importDefault(require("axios"));
const KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token';
// auth code -> refresh token
function getKakaoTokens(code) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.KAKAO_CLIENT_ID,
            redirect_uri: process.env.KAKAO_REDIRECT_URI,
            code,
            client_secret: process.env.KAKAO_CLIENT_SECRET,
        });
        const res = yield axios_1.default.post('https://kauth.kakao.com/oauth/token', body.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return res.data;
    });
}
// refresh token -> access token
function refreshKakaoAccessToken(refreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: process.env.KAKAO_CLIENT_ID,
            refresh_token: refreshToken,
        });
        const res = yield axios_1.default.post('https://kauth.kakao.com/oauth/token', body.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return res.data;
    });
}
function getKakaoUserInfo(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield axios_1.default.get('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
        });
        return data;
    });
}
function verifyKakaoRefreshToken(refreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const params = new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: process.env.KAKAO_CLIENT_ID,
                client_secret: process.env.KAKAO_CLIENT_SECRET, // 설정에 따라 필요할 수 있음
                refresh_token: refreshToken,
            });
            const response = yield axios_1.default.post('https://kauth.kakao.com/oauth/token', params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            // 새 액세스 토큰이 정상적으로 발급되면 토큰 유효
            return !!response.data.access_token;
        }
        catch (error) {
            if (error.response) {
                console.error('Kakao refresh token verification failed:', error.response.data);
            }
            else {
                console.error('Kakao refresh token verification error:', error.message);
            }
            return false;
        }
    });
}

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
exports.getGoogleTokens = getGoogleTokens;
exports.getGoogleUserInfo = getGoogleUserInfo;
exports.refreshGoogleAccessToken = refreshGoogleAccessToken;
exports.verifyGoogleRefreshToken = verifyGoogleRefreshToken;
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// auth code -> token
function getGoogleTokens(code) {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code',
        };
        const response = yield axios_1.default.post('https://oauth2.googleapis.com/token', qs_1.default.stringify(payload), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        return response.data;
    });
}
// 액세스 토큰 -> 사용자 정보 추출
function getGoogleUserInfo(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
    });
}
// refresh access -> access token
function refreshGoogleAccessToken(refreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        };
        const response = yield axios_1.default.post('https://oauth2.googleapis.com/token', qs_1.default.stringify(payload), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        return response.data;
    });
}
function verifyGoogleRefreshToken(refreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const params = new URLSearchParams();
            params.append('client_id', process.env.GOOGLE_CLIENT_ID);
            params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);
            params.append('refresh_token', refreshToken);
            params.append('grant_type', 'refresh_token');
            const response = yield axios_1.default.post('https://oauth2.googleapis.com/token', params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            // 성공적으로 새 액세스 토큰을 받았으면 토큰이 유효함
            return !!response.data.access_token;
        }
        catch (error) {
            // 에러 발생 시 리프레시 토큰이 유효하지 않거나 만료된 것으로 간주
            if (error.response) {
                console.error('Google refresh token verification failed:', error.response.data);
            }
            else {
                console.error('Google refresh token verification error:', error.message);
            }
            return false;
        }
    });
}

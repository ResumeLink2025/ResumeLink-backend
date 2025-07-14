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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = require("../utils/bcrypt");
const jwt_1 = require("../utils/jwt");
const google_1 = require("../utils/google");
const auth_repository_1 = require("../repositories/auth.repository");
const auth_dto_1 = require("../dtos/auth.dto");
const class_transformer_1 = require("class-transformer");
const kakao_1 = require("../utils/kakao");
class AuthService {
    constructor(authRepository = new auth_repository_1.AuthRepository()) {
        this.authRepository = authRepository;
    }
    registerUser(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password, nickname } = input;
            const existingEmail = yield this.authRepository.findByEmail(email);
            if (existingEmail)
                throw new Error('이미 존재하는 이메일입니다.');
            const hashed = yield (0, bcrypt_1.hashPassword)(password);
            const user = yield this.authRepository.createUser(email, hashed, nickname || "username");
            const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id });
            const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id });
            const response = { userId: user.id, accessToken, refreshToken };
            const responseDto = (0, class_transformer_1.plainToInstance)(auth_dto_1.AuthTokenResponseDto, response);
            return responseDto;
        });
    }
    loginUser(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = input;
            const existingEmail = yield this.authRepository.findByEmail(email);
            if (!existingEmail)
                throw new Error('이메일 또는 비밀번호가 잘못되었습니다.');
            const user = existingEmail;
            // 로컬 프로바이더가 아닐 경우 예외 처리
            if (user.authProvider !== 'local') {
                throw new Error(`해당 이메일은 ${user.authProvider} 로그인으로 등록된 계정입니다.`);
            }
            const verify = yield (0, bcrypt_1.verifyPassword)(password, existingEmail.password);
            if (!verify)
                throw new Error('이메일 또는 비밀번호가 잘못되었습니다.');
            const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id });
            const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id });
            const response = { userId: user.id, accessToken, refreshToken };
            const responseDto = (0, class_transformer_1.plainToInstance)(auth_dto_1.AuthTokenResponseDto, response);
            return responseDto;
        });
    }
    // 구글 Oauth 로그인 및 신규 가입
    loginGoogle(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { code } = input;
            const tokens = yield (0, google_1.getGoogleTokens)(code);
            const accessToken = tokens.access_token;
            const refreshToken = tokens.refresh_token;
            console.log({
                accessToken,
                refreshToken
            });
            const data = yield (0, google_1.getGoogleUserInfo)(accessToken);
            if (!data.id)
                throw new Error("액세스 토큰이 잘못되었습니다.");
            let user = yield this.authRepository.findByAuthProviderId('google', data.id);
            if (!user) {
                user = yield this.authRepository.createOAuthUser('google', data.id, data.email, data.name);
            }
            const refreshInput = {
                userId: user.id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
            };
            yield this.authRepository.updateRefreshToken(refreshInput);
            const token = (0, jwt_1.generateAccessToken)({ userId: user.id });
            return { userId: user.id, accessToken: token, refreshToken };
        });
    }
    // 카카오 Oauth 로그인 및 신규 가입
    loginKakao(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { code } = input;
            const tokens = yield (0, kakao_1.getKakaoTokens)(code);
            const accessToken = yield tokens.access_token;
            const refreshToken = tokens.refresh_token;
            const data = yield (0, kakao_1.getKakaoUserInfo)(accessToken);
            if (!data.id)
                throw new Error("액세스 토큰이 잘못되었습니다.");
            // authProviderId는 'kakao', 식별자는 data.id
            let user = yield this.authRepository.findByAuthProviderId('kakao', String(data.id));
            if (!user) {
                const email = ((_a = data.kakao_account) === null || _a === void 0 ? void 0 : _a.email) || `${data.id}@kakao.com`;
                const name = ((_b = data.properties) === null || _b === void 0 ? void 0 : _b.nickname) || 'username';
                user = yield this.authRepository.createOAuthUser('kakao', String(data.id), email, name);
            }
            const refreshInput = {
                userId: user.id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            };
            yield this.authRepository.updateRefreshToken(refreshInput);
            const token = (0, jwt_1.generateAccessToken)({ userId: user.id });
            return {
                userId: user.id,
                accessToken: token,
                refreshToken,
            };
        });
    }
    refreshAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenRecord = yield this.authRepository.findRefreshToken(refreshToken);
            if (!tokenRecord)
                throw new Error('Refresh token not found');
            if (tokenRecord.expiresAt < new Date())
                throw new Error('Refresh token expired');
            const user = yield this.authRepository.findById(tokenRecord.userId);
            if (!user)
                throw new Error('User not found');
            if (user.authProvider === 'google') {
                const valid = yield (0, google_1.verifyGoogleRefreshToken)(refreshToken);
                if (!valid)
                    throw new Error('Invalid Google refresh token');
            }
            else if (user.authProvider === 'kakao') {
                const valid = yield (0, kakao_1.verifyKakaoRefreshToken)(refreshToken);
                if (!valid)
                    throw new Error('Invalid Kakao refresh token');
            }
            // 'local' provider의 경우, DB에 토큰이 있고 만료되지 않았다면 유효한 것으로 간주합니다.
            return (0, jwt_1.generateAccessToken)({ userId: user.id });
        });
    }
}
exports.AuthService = AuthService;

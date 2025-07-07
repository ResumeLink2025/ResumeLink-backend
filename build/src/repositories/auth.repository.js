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
exports.AuthRepository = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
class AuthRepository {
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.userAuth.findUnique({ where: { email } });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.userAuth.findUnique({ where: { id } });
        });
    }
    findByAuthProviderId(authProvider, authProviderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.userAuth.findFirst({
                where: {
                    authProvider,
                    authProviderId,
                },
            });
        });
    }
    // 유저 등록
    createUser(email, hashedPassword, nickname) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.default.userAuth.create({
                data: {
                    email,
                    password: hashedPassword,
                    profile: {
                        create: {
                            nickname: nickname,
                            birthday: new Date('2000-01-01')
                        },
                    },
                },
                include: {
                    profile: true,
                },
            });
        });
    }
    // OAUTH 기반 유저 등록
    createOAuthUser(authProvider, authProviderId, email, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.userAuth.create({
                data: {
                    authProvider,
                    authProviderId,
                    email,
                    profile: {
                        create: {
                            nickname: name !== null && name !== void 0 ? name : '',
                            birthday: new Date('2000-01-01'),
                        },
                    },
                },
                include: {
                    profile: true,
                },
            });
        });
    }
    updateRefreshToken(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingToken = yield prisma_1.default.refreshToken.findFirst({
                where: {
                    userId: data.userId,
                    // 필요하면 userAgent, ipAddress 등 조건 추가
                },
            });
            if (existingToken) {
                return prisma_1.default.refreshToken.update({
                    where: { id: existingToken.id },
                    data: {
                        token: data.token,
                        expiresAt: data.expiresAt,
                        createdAt: new Date(),
                        userAgent: data.userAgent,
                        ipAddress: data.ipAddress,
                    },
                });
            }
            else {
                return prisma_1.default.refreshToken.create({
                    data: {
                        userId: data.userId,
                        token: data.token,
                        expiresAt: data.expiresAt,
                        createdAt: new Date(),
                        userAgent: data.userAgent,
                        ipAddress: data.ipAddress,
                    },
                });
            }
        });
    }
    findRefreshToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.refreshToken.findUnique({
                where: { token },
            });
        });
    }
}
exports.AuthRepository = AuthRepository;

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
exports.CoffeeChatRepository = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
class CoffeeChatRepository {
    // 1. 커피챗 생성
    createCoffeeChat(requesterId, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.coffeeChat.create({
                data: {
                    requesterId,
                    receiverId,
                    status: client_1.CoffeeChatStatus.pending,
                },
            });
        });
    }
    // 2. 상태 변경 (수락/거절)
    updateStatus(coffeeChatId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.coffeeChat.update({
                where: { id: coffeeChatId },
                data: {
                    status,
                    respondedAt: new Date(),
                },
            });
        });
    }
    // 3. 대기중인(진행중) 커피챗 중 중복 확인
    findPendingBetween(requesterId, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.coffeeChat.findFirst({
                where: {
                    requesterId,
                    receiverId,
                    status: client_1.CoffeeChatStatus.pending,
                },
            });
        });
    }
    // 4. 내가 신청한 커피챗 목록
    getRequestedChats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.coffeeChat.findMany({
                where: { requesterId: userId },
                orderBy: { createdAt: 'desc' }
            });
        });
    }
    // 5. 내가 받은 커피챗 목록
    getReceivedChats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.coffeeChat.findMany({
                where: { receiverId: userId },
                orderBy: { createdAt: 'desc' }
            });
        });
    }
    // 6. 신청/받은 전체 커피챗 목록
    getAllChats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.coffeeChat.findMany({
                where: {
                    OR: [
                        { requesterId: userId },
                        { receiverId: userId }
                    ]
                },
                orderBy: { createdAt: 'desc' }
            });
        });
    }
    // 7. 커피챗 단일 상세 조회 (서비스에서 권한 검증 완료)
    getCoffeeChatDetail(coffeeChatId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.coffeeChat.findUnique({
                where: { id: coffeeChatId }
            });
        });
    }
    // 8. 커피챗 취소(삭제) - 본인+대기상태만
    cancelCoffeeChat(coffeeChatId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.coffeeChat.deleteMany({
                where: {
                    id: coffeeChatId,
                    requesterId: userId,
                    status: client_1.CoffeeChatStatus.pending,
                }
            });
        });
    }
}
exports.CoffeeChatRepository = CoffeeChatRepository;
const coffeechatRepository = new CoffeeChatRepository();
exports.default = coffeechatRepository;

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
const coffeechat_service_1 = __importDefault(require("../services/coffeechat.service"));
const client_1 = require("@prisma/client");
const ServiceError_1 = require("../utils/ServiceError");
const coffeechatController = {
    // 1. 커피챗 신청 생성
    createCoffeeChat: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            // 타입 캐스팅
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { receiverId } = req.body;
            if (!receiverId || !userId) {
                return res.status(400).json({ message: '신청자, 수신자 정보가 필요합니다.' });
            }
            const chat = yield coffeechat_service_1.default.createCoffeeChat(userId, receiverId);
            res.status(201).json({ message: '커피챗 신청이 완료되었습니다.', data: chat });
        }
        catch (error) {
            if (error instanceof ServiceError_1.ServiceError) {
                return res.status(error.status).json({ message: error.message });
            }
            console.error('커피챗 신청 실패:', error);
            res.status(500).json({ message: '커피챗 신청 중 오류가 발생했습니다.' });
        }
    }),
    // 2. 커피챗 상태 변경 (수락/거절)
    updateStatus: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!id || !userId) {
                return res.status(400).json({ message: '필수 파라미터가 누락되었습니다.' });
            }
            if (!status || !Object.values(client_1.CoffeeChatStatus).includes(status)) {
                return res.status(400).json({ message: '잘못된 상태값입니다.' });
            }
            const result = yield coffeechat_service_1.default.updateStatus(id, status, userId);
            res.json({ message: '상태가 성공적으로 변경되었습니다.', data: result });
        }
        catch (error) {
            if (error instanceof ServiceError_1.ServiceError) {
                return res.status(error.status).json({ message: error.message });
            }
            console.error('상태 변경 실패:', error);
            res.status(500).json({ message: '상태 변경 중 오류가 발생했습니다.' });
        }
    }),
    // 3. 커피챗 목록 조회
    getCoffeeChats: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { type } = req.query;
            if (!userId) {
                return res.status(401).json({ message: '로그인이 필요합니다.' });
            }
            const list = yield coffeechat_service_1.default.getCoffeeChats(userId, type);
            res.json({ message: '목록 조회가 완료되었습니다.', data: list });
        }
        catch (error) {
            if (error instanceof ServiceError_1.ServiceError) {
                return res.status(error.status).json({ message: error.message });
            }
            console.error('목록 조회 실패:', error);
            res.status(500).json({ message: '목록 조회 중 오류가 발생했습니다.' });
        }
    }),
    // 4. 커피챗 상세 조회
    getCoffeeChatDetail: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { id } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!id || !userId) {
                return res.status(400).json({ message: '필수 파라미터가 누락되었습니다.' });
            }
            const detail = yield coffeechat_service_1.default.getCoffeeChatDetail(id, userId);
            res.json({ message: '상세 정보 조회가 완료되었습니다.', data: detail });
        }
        catch (error) {
            if (error instanceof ServiceError_1.ServiceError) {
                return res.status(error.status).json({ message: error.message });
            }
            console.error('상세 정보 조회 실패:', error);
            res.status(500).json({ message: '상세 정보 조회 중 오류가 발생했습니다.' });
        }
    }),
    // 5. 커피챗 신청 취소(삭제)
    cancelCoffeeChat: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { id } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!id || !userId) {
                return res.status(400).json({ message: '필수 파라미터가 누락되었습니다.' });
            }
            yield coffeechat_service_1.default.cancelCoffeeChat(id, userId);
            res.status(204).send();
        }
        catch (error) {
            if (error instanceof ServiceError_1.ServiceError) {
                return res.status(error.status).json({ message: error.message });
            }
            console.error('취소 실패:', error);
            res.status(500).json({ message: '취소 중 오류가 발생했습니다.' });
        }
    })
};
exports.default = coffeechatController;

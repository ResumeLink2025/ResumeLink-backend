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
const coffeechat_controller_1 = __importDefault(require("../controllers/coffeechat.controller"));
const middleware_auth_1 = require("../middlewares/middleware.auth");
const middleware_dto_1 = require("../middlewares/middleware.dto");
const coffeechat_dto_1 = require("../dtos/coffeechat.dto");
const router = (0, express_1.Router)();
// 인증 미들웨어 적용
router.use(middleware_auth_1.authMiddleware);
// 커피챗 생성
router.post('/', (0, middleware_dto_1.validateDto)(coffeechat_dto_1.CreateCoffeeChatDto), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield coffeechat_controller_1.default.createCoffeeChat(req, res);
}));
// 커피챗 요청 수락/거절
router.patch('/:id/status', (0, middleware_dto_1.validateDto)(coffeechat_dto_1.UpdateCoffeeChatStatusDto), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield coffeechat_controller_1.default.updateStatus(req, res);
}));
// 커피챗 목록 통합 조회
router.get('/', (0, middleware_dto_1.validateDto)(coffeechat_dto_1.GetCoffeeChatsQueryDto, 'query'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield coffeechat_controller_1.default.getCoffeeChats(req, res);
}));
// 커피챗 상세 조회
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield coffeechat_controller_1.default.getCoffeeChatDetail(req, res);
}));
// 커피챗 신청 취소 (삭제)
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield coffeechat_controller_1.default.cancelCoffeeChat(req, res);
}));
exports.default = router;

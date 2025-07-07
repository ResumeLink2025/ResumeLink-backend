"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createMainRouter;
const express_1 = require("express");
const auth_router_1 = __importDefault(require("./auth.router"));
const coffeechat_router_1 = __importDefault(require("./coffeechat.router"));
const chat_router_1 = __importDefault(require("./chat.router"));
// Socket.IO 인스턴스를 받는 팩토리 함수로 변경
function createMainRouter(io) {
    const router = (0, express_1.Router)();
    router.use('/users', auth_router_1.default);
    router.use('/coffee-chats', coffeechat_router_1.default);
    router.use('/chats', (0, chat_router_1.default)(io));
    return router;
}

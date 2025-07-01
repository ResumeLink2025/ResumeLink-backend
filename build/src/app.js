"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_router_1 = __importDefault(require("./routers/auth.router"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/api/auth', auth_router_1.default);
app.set("port", process.env.PORT || 3000);
app.get("/", (req, res) => {
    res.send("Hello World!");
});
// 테스트를 위한 간단한 새 엔드포인트 추가 (미사용 변수/경로 확인용)
app.get('/test-route2', (req, res) => {
    const unusedVariable = "이 변수는 사용되지 않습니다."; // 의도적으로 사용되지 않는 변수
    res.send('This is a test endpoint.');
});
exports.default = app;

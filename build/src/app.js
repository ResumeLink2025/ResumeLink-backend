"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routers_1 = __importDefault(require("./routers")); // 팩토리 함수로 변경
const auth_router_1 = __importDefault(require("./routers/auth.router"));
const resume_router_1 = __importDefault(require("./routers/resume.router"));
const profile_router_1 = __importDefault(require("./routers/profile.router"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
// Socket.IO 인스턴스를 받는 팩토리 함수로 변경
function createApp(io) {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: 'http://localhost:3000',
        credentials: true,
    }));
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
    // Socket.IO 인스턴스를 라우터에 전달
    app.use('/api', (0, routers_1.default)(io));
    app.use('/api/auth', auth_router_1.default);
    app.use('/api/resumes', resume_router_1.default);
    app.use('/api/profile', profile_router_1.default);
    app.set("port", process.env.PORT || 3000);
    app.get("/", (req, res) => {
        res.send("Hello World!");
    });
    return app;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const accessToken = (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer ')) ? authHeader.split(' ')[1] : null;
    if (!accessToken) {
        res.status(401).json({ message: '액세스 토큰이 필요합니다.' });
        return;
    }
    try {
        const decoded = (0, jwt_1.verifyAccessToken)(accessToken);
        if (typeof decoded === 'string' || !decoded.userId) {
            res.status(401).json({ message: '유효하지 않은 액세스 토큰입니다.' });
            return;
        }
        req.user = { userId: decoded.userId };
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ message: '액세스 토큰 만료, 재발급이 필요합니다.' });
        }
        else {
            res.status(401).json({ message: '유효하지 않은 액세스 토큰입니다.' });
        }
    }
};
exports.authMiddleware = authMiddleware;

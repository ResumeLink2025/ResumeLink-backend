"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = exports.verifyRefreshToken = exports.verifyAccessToken = void 0;
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN;
function generateAccessToken(payload) {
    const options = { expiresIn: validateExpiresIn(ACCESS_TOKEN_EXPIRES_IN) };
    return jsonwebtoken_1.default.sign(payload, ACCESS_TOKEN_SECRET, options);
}
const verifyAccessToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
    if (typeof decoded === 'string') {
        throw new Error('잘못된 토큰 형식입니다.');
    }
    if (!decoded.userId || typeof decoded.userId !== 'string') {
        throw new Error('userId가 토큰에 없습니다.');
    }
    return { userId: decoded.userId };
};
exports.verifyAccessToken = verifyAccessToken;
function generateRefreshToken(payload) {
    const options = {
        expiresIn: validateExpiresIn(REFRESH_TOKEN_EXPIRES_IN)
    };
    return jsonwebtoken_1.default.sign(payload, REFRESH_TOKEN_SECRET, options);
}
const verifyRefreshToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
    if (typeof decoded === 'string') {
        throw new Error('잘못된 토큰 형식입니다.');
    }
    if (!decoded.userId || typeof decoded.userId !== 'string') {
        throw new Error('userId가 토큰에 없습니다.');
    }
    return { userId: decoded.userId };
};
exports.verifyRefreshToken = verifyRefreshToken;
function validateExpiresIn(value) {
    const defaultValue = '1h';
    const stringValueRegex = /^(\d+)(years?|yrs?|yr|y|weeks?|w|days?|d|hours?|hrs?|hr|h|minutes?|mins?|min|m|seconds?|secs?|sec|s|milliseconds?|millis?|ms)$/i;
    if (value == undefined)
        return defaultValue;
    if (stringValueRegex.test(value)) {
        return value;
    }
    return defaultValue;
}
// 사용하지 않을 예정
const signToken = (payload) => {
    const options = { expiresIn: validateExpiresIn(JWT_EXPIRES_IN) };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
};
exports.signToken = signToken;
const verifyToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    if (typeof decoded === 'string') {
        throw new Error('잘못된 토큰 형식입니다.');
    }
    if (!decoded.userId || typeof decoded.userId !== 'string') {
        throw new Error('userId가 토큰에 없습니다.');
    }
    return { userId: decoded.userId };
};
exports.verifyToken = verifyToken;

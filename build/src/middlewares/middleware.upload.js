"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessageType = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// 파일 저장 설정
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/chat/');
    },
    filename: (req, file, cb) => {
        var _a;
        // 파일명: timestamp_userId_originalname
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || 'unknown';
        const timestamp = Date.now();
        const ext = path_1.default.extname(file.originalname);
        const nameWithoutExt = path_1.default.basename(file.originalname, ext);
        const filename = `${timestamp}_${userId}_${nameWithoutExt}${ext}`;
        cb(null, filename);
    }
});
// 파일 필터 (이미지와 일반 파일만 허용)
const fileFilter = (req, file, cb) => {
    // 허용되는 MIME 타입들
    const allowedMimes = [
        // 이미지
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        // 문서
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        // 텍스트
        'text/plain',
        'text/csv',
        // 압축 파일
        'application/zip',
        'application/x-rar-compressed',
        // 기타
        'application/json'
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('지원하지 않는 파일 형식입니다.'));
    }
};
// Multer 설정
exports.uploadMiddleware = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB 제한
        files: 1 // 한 번에 하나의 파일만
    }
});
// 파일 타입 판별 함수
const getMessageType = (mimetype) => {
    if (mimetype.startsWith('image/')) {
        return 'IMAGE';
    }
    return 'FILE';
};
exports.getMessageType = getMessageType;

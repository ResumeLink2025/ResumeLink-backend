import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, 'uploads/chat/');
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // 파일명: timestamp_userId_originalname
    const userId = req.user?.userId || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const filename = `${timestamp}_${userId}_${nameWithoutExt}${ext}`;
    cb(null, filename);
  }
});

// 파일 필터 (이미지와 일반 파일만 허용)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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
  } else {
    cb(new Error('지원하지 않는 파일 형식입니다.'));
  }
};

// Multer 설정
export const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 제한
    files: 1 // 한 번에 하나의 파일만
  }
});

// 파일 타입 판별 함수
export const getMessageType = (mimetype: string): 'IMAGE' | 'FILE' => {
  if (mimetype.startsWith('image/')) {
    return 'IMAGE';
  }
  return 'FILE';
};

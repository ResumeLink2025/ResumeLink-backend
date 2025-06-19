import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export const authMiddleware: RequestHandler =(req: AuthenticatedRequest, res: Response, next: NextFunction):void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    if (typeof decoded === 'string' || !decoded.userId) {
        res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
        return;
    }
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: '토큰 검증 실패' });
    return;
  }
};
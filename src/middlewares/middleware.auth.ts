import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export const authMiddleware: RequestHandler = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!accessToken) {
    res.status(401).json({ message: '액세스 토큰이 필요합니다.' });
    return;
  }

  try {
    const decoded = verifyAccessToken(accessToken);
    if (typeof decoded === 'string' || !decoded.userId) {
      res.status(401).json({ message: '유효하지 않은 액세스 토큰입니다.' });
      return;
    }
    req.user = { userId: decoded.userId };
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: '액세스 토큰 만료, 재발급이 필요합니다.' });
    } else {
      res.status(401).json({ message: '유효하지 않은 액세스 토큰입니다.' });
    }
  }
};
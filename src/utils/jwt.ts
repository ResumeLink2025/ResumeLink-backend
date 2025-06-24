import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { StringValue } from 'ms';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

const ACCESS_TOKEN_EXPIRES_IN  = process.env.ACCESS_TOKEN_EXPIRES_IN;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN;

interface TokenPayload {
  userId: string;
}

export function generateAccessToken(payload: TokenPayload): string {
    const options: SignOptions = { expiresIn: validateExpiresIn(ACCESS_TOKEN_EXPIRES_IN) };

    return jwt.sign(payload, ACCESS_TOKEN_SECRET, options);
}

export const verifyAccessToken = (token: string): { userId: string } => {
  const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
  
  if (typeof decoded === 'string') {
    throw new Error('잘못된 토큰 형식입니다.');
  }

  if (!decoded.userId || typeof decoded.userId !== 'string') {
    throw new Error('userId가 토큰에 없습니다.');
  }

  return { userId: decoded.userId };
};

export function generateRefreshToken(payload: TokenPayload): string{
    const options: SignOptions = {
      expiresIn: validateExpiresIn(REFRESH_TOKEN_EXPIRES_IN) };

    return jwt.sign(payload, REFRESH_TOKEN_SECRET, options);
}

export const verifyRefreshToken = (token: string): { userId: string } => {
  const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
  
  if (typeof decoded === 'string') {
    throw new Error('잘못된 토큰 형식입니다.');
  }

  if (!decoded.userId || typeof decoded.userId !== 'string') {
    throw new Error('userId가 토큰에 없습니다.');
  }

  return { userId: decoded.userId };
};

function validateExpiresIn(value: string | undefined): StringValue{

    const defaultValue = '1h'
    const stringValueRegex: RegExp = /^(\d+)(years?|yrs?|yr|y|weeks?|w|days?|d|hours?|hrs?|hr|h|minutes?|mins?|min|m|seconds?|secs?|sec|s|milliseconds?|millis?|ms)$/i;

    if (value == undefined) return defaultValue
    if (stringValueRegex.test(value)){
        return value as StringValue
    }
    return defaultValue
}

// 사용하지 않을 예정
export const signToken = (payload: object): string => {

    const options: SignOptions = { expiresIn: validateExpiresIn(JWT_EXPIRES_IN) };
    
    return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): { userId: string } => {
  const decoded = jwt.verify(token, JWT_SECRET);
  
  if (typeof decoded === 'string') {
    throw new Error('잘못된 토큰 형식입니다.');
  }

  if (!decoded.userId || typeof decoded.userId !== 'string') {
    throw new Error('userId가 토큰에 없습니다.');
  }

  return { userId: decoded.userId };
};
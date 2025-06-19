import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { StringValue } from 'ms';

const JWT_SECRET = process.env.JWT_SECRET!;


const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export const signToken = (payload: object): string => {

    const options: SignOptions = { expiresIn: validateExpiresIn(JWT_EXPIRES_IN) };
    
    return jwt.sign(payload, JWT_SECRET, options);
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
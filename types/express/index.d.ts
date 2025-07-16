import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
    };
    validatedBody?: object;
    validatedParams?: object;
    validatedQuery?: object;
  }
  
}

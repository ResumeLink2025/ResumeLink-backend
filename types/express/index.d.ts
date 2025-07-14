import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
    };
    validatedBody?: any;
    validatedParams?: any;
    validatedQuery?: any;
  }
  
}

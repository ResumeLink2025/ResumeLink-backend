import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

export function validateDto(dtoClass: any, source: 'body' | 'params' | 'query' = 'body') {
  return async (req: Request, res: Response, next: NextFunction) => {

    const target = req[source];
    const dtoInstance = plainToInstance(dtoClass, target);
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      const errorMessages = errors.flatMap(err =>
        Object.values(err.constraints || {})
      );
      res.status(400).json({ message: '입력값이 잘못되었습니다.', errors: errorMessages });
      return;
    }

    const keyMap = {
      body: 'validatedBody',
      params: 'validatedParams',
      query: 'validatedQuery',
    } as const;

    const validatedKey = keyMap[source];
    req[validatedKey] = dtoInstance;
    
    next();
  };
}

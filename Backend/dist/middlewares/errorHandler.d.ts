import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
export declare const errorHandler: (err: AppError | Error, req: Request, res: Response, next: NextFunction) => void;
export default errorHandler;
//# sourceMappingURL=errorHandler.d.ts.map
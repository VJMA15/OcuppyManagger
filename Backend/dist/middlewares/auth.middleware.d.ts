import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => void;
export declare const authorizeRoles: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requireRole: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
export declare const authorize: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
declare const _default: {
    authenticateToken: (req: Request, res: Response, next: NextFunction) => void;
    authorizeRoles: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
    requireRole: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
    authenticate: (req: Request, res: Response, next: NextFunction) => void;
    authorize: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
};
export default _default;
//# sourceMappingURL=auth.middleware.d.ts.map
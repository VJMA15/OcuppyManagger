import { Request, Response, NextFunction } from 'express';
export declare const register: (req: Request, res: Response, next: NextFunction) => void;
export declare const login: (req: Request, res: Response, next: NextFunction) => void;
export declare const verify: (req: Request, res: Response, next: NextFunction) => void;
export declare const logout: (req: Request, res: Response) => void;
export declare const refreshToken: (req: Request, res: Response, next: NextFunction) => void;
export declare const forgotPassword: (req: Request, res: Response, next: NextFunction) => void;
export declare const resetPassword: (req: Request, res: Response, next: NextFunction) => void;
export declare const updatePassword: (req: Request, res: Response, next: NextFunction) => void;
declare const _default: {
    register: (req: Request, res: Response, next: NextFunction) => void;
    login: (req: Request, res: Response, next: NextFunction) => void;
    verify: (req: Request, res: Response, next: NextFunction) => void;
    logout: (req: Request, res: Response) => void;
    refreshToken: (req: Request, res: Response, next: NextFunction) => void;
    forgotPassword: (req: Request, res: Response, next: NextFunction) => void;
    resetPassword: (req: Request, res: Response, next: NextFunction) => void;
    updatePassword: (req: Request, res: Response, next: NextFunction) => void;
};
export default _default;
//# sourceMappingURL=auth.controller.d.ts.map
import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const generateToken: (userId: string) => string;
export {};
//# sourceMappingURL=auth.d.ts.map
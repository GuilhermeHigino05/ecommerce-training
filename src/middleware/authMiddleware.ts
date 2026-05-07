import { Request, Response, NextFunction } from "express";
// @ts-ignore
import jwt from 'jsonwebtoken'
class AuthMiddleware{
    private verifyAdmin = (req: Request, res: Response): boolean => {
        try {
            const tokenAdmin = req.cookies?.tokenAdmin;
            if (!tokenAdmin) return false;
            jwt.verify(tokenAdmin, process.env.SECRETTOKENTOADMIN as string);
            return true; 
        } catch (error) {
            return false;
        }
    }
    public verifyUserLogIn = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const isAdmin = this.verifyAdmin(req, res);
            if (isAdmin) {
                return next(); 
            }
            const token = req.cookies?.token;
            if (!token) {
                return res.redirect('/user/login');
            }
            jwt.verify(token, process.env.SECRETTOKEN as string);
            return next();
        }catch(error){
            return res.redirect('/user/login');
        }
        
    }

    public verifyAdminOnly = async (req: Request, res: Response, next: NextFunction) => {
        const isAdmin = this.verifyAdmin(req, res);
        if (isAdmin) {
            return next();
        }
        return res.status(403).send({ok: false, msg: 'Access denied: admin only'});
    }
}

export default AuthMiddleware;
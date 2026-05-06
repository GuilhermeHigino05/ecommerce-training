import { Request, Response, NextFunction } from "express";
import UserModel from "../Model/user/userModel";

class AuthMiddleware{
    public async verifyUserLogIn(req: Request, res: Response, next: NextFunction){
        if(req.cookies != undefined && req.cookies.usuarioLogado){
            const userId = req.cookies.usuarioLogado
            
            const user = new UserModel(0,'','','','');
            let result = await user.GetUser(userId);
            if(result){
                next();
            }else{
                res.redirect('/user/login');
            
            }
        }else{
            res.redirect('/user/login');
        }
    }
}

export default AuthMiddleware;
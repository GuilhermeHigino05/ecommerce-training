import { Request, Response } from 'express';
import UserModel from '../../Model/user/userModel';
// @ts-ignore
import bcrypt from 'bcrypt';
// @ts-ignore
import jwt from 'jsonwebtoken'

const SECRET = process.env.SECRETTOKEN
const SECRETADMIN = process.env.SECRETTOKENTOADMIN
class UserController{
    
    public async loginView(req: Request, res: Response){
        res.render('login.html');
    }

    public async Login(req: Request, res: Response){
        const {name, email, password} = req.body;
        let ok = false;
        let msg = '';

        if(name.length < 3){ 
            return res.send({ok: false, msg: 'Invalid Name'})
        }
        if(!email.includes('@') || !email.includes('.com')){
            return res.send({ok: false, msg: 'Invalid Email'})
        }
        if(password.length < 8){
            return res.send({ok: false, msg: 'invalid password'});
        }
        try{
            const user = new UserModel(0, name, email, '', password);
            let result = await user.Login(name, email);
            if(result){
                const isPasswordValid = await bcrypt.compare(password, result.tb_user_password);
                if(!isPasswordValid){
                    return res.status(401).send({ok: false, msg: 'Invalid credentials'});
                }
                const token = jwt.sign(
                    {
                        id: result.tb_user_id,
                        name: result.tb_user_name,
                    },
                    SECRET,
                    {
                        expiresIn: '8h'
                    }
                )    
                const tokenAdmin = jwt.sign(
                    {
                        id: result.tb_user_id,
                        name: result.tb_user_name,
                    },
                    SECRETADMIN,
                    {
                        expiresIn: '3h'
                    }
                )
                if(result.tb_user_status === 'admin'){
                    res.cookie('tokenAdmin', tokenAdmin, {httpOnly: true, maxAge: 3*60*60*1000, secure: true, sameSite: 'lax'})
                }else{
                    res.cookie('token', token, {httpOnly: true, maxAge: 8*60*60*1000, secure: true, sameSite: 'lax'});
                }
                res.status(200).send({ok: true, msg: 'User suscesfully logged'})
            }else{
                res.status(401).send({ok: false, msg: 'User not found'})
            }
        }catch(error){
            console.log(error);
            res.status(500).send({ok: false, msg: 'Internal Error'})
        }
    }

    public async registerView(req: Request, res: Response){
        res.render('cadastro.html');
    }

    public async Register(req: Request, res: Response){
        const {name, email, password, phone} = req.body;
        let ok = false;
        let msg = '';
        if(name.length < 3){ 
            return res.send({ok: false, msg: 'Invalid Name'})
        }
        if(!email.includes('@') || !email.includes('.com')){
            return res.send({ok: false, msg: 'Invalid Email'})
        }
        if(password.length < 8){
            return res.send({ok: false, msg: 'invalid password'});
        }
        if(phone.length < 10 || phone.length > 20){
            return res.send({ok: false, msg: 'Invalid phone'});
        }

        try{
            const passwordHash = await bcrypt.hash(password, 10);
            const user = new UserModel(0, name, email, phone, passwordHash);
            let result = await user.Register();
            if(result){
                const token = jwt.sign(
                    {
                        id: result.tb_user_id,
                        name: result.tb_user_name,
                    },
                    SECRET,
                    {
                        expiresIn: '8h'
                    }
                )
                res.cookie('token', token, {httpOnly: true, maxAge: 8*60*60*1000, secure: true, sameSite: 'lax'});
                res.status(200).send({ok: true, msg: 'User suscesfully regitered'})
            }else{
                res.status(500).send({ok: false, msg: 'Error registerings user'})
            }
        }catch(error){
            console.log(error);
            res.status(500).send({ok: false, msg: 'Internal Error'})
        }

    }
}

export default UserController
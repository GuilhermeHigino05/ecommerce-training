import { Request, Response } from 'express';
import UserModel from '../../Model/user/userModel';

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
            let result = await user.Login(name, email, password);
            if(result){
                res.cookie('usuarioLogado', result, {httpOnly: true});
                res.status(200).send({ok: true, msg: 'User suscesfully logged'})
            }else{
                res.status(500).send({ok: false, msg: 'Error logging user'})
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
            const user = new UserModel(0, name, email, phone, password);
            let result = await user.Register();
            if(result){
                res.cookie('usuarioLogado', result);
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
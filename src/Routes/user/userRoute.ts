import express from  'express'
import UserController from '../../Controller/user/userController';
const route = express.Router();

const controller = new UserController();

route.get('/register',controller.registerView);
route.post('/register',controller.Register);
route.get('/login',controller.loginView);
route.post('/login',controller.Login);

export default route;
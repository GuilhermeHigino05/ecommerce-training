import express from 'express';
const Router = express.Router();
import HomeController from '../Controller/homeController';
const homeController = new HomeController();

Router.get('/', homeController.home);

export default Router;
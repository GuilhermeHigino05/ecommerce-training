import express from 'express';
const Router = express.Router();
import HomeController from '../Controller/homeController';
import PedidoController from "../Controller/venda/PedidoController"
const homeController = new HomeController();
const pedidoController = new PedidoController();

Router.get('/', homeController.home);
Router.get('/obter/:id', homeController.getProducts);
Router.post('/request', pedidoController.Create)

export default Router;
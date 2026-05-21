import express from 'express';
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


import homeRoute from './Routes/homeRoute';
import productsRoute from './Routes/admin/productsRoute';
import userRoute from './Routes/user/userRoute';
import AuthMiddleware from './middleware/authMiddleware';
// @ts-ignore
import cookieParser from 'cookie-parser';

(global as any).PATH_FROM_IMAGE = '/img'

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('src/public'));
app.use(cookieParser());
app.set('views', './src/View');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use('/user', userRoute);
let auth = new AuthMiddleware();
app.use(auth.verifyUserLogIn);
app.use('/', homeRoute);
app.use('/admin/products', auth.verifyAdminOnly, productsRoute)

app.listen(port, () => {
  console.log(`Servidor rodando ! http://localhost:${port}`);
});
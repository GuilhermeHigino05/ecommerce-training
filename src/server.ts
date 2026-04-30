import express from 'express';
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
import homeRoute from './Routes/homeRoute';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('views', './src/View');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use('/', homeRoute);

app.listen(port, () => {
  console.log(`Servidor rodando ! http://localhost:${port}`);
});
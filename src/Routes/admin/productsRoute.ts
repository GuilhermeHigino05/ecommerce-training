import express from 'express';
import ProductsController from '../../Controller/admin/ProductsController';
import upload from '../../middleware/multerconfig'


const router = express.Router();
const productsController = new ProductsController();

router.get('/', productsController.ListView);
router.get('/create', productsController.CreateView);
router.post('/create', upload.single('img'), productsController.Create);
export default router;
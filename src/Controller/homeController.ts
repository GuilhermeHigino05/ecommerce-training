import ProductModel from "../Model/admin/ProductsModel";


class HomeController {


    public async home(req: any, res: any) {
        const products = new ProductModel(0, '', 0, '', '');
        const result = await products.List();
        res.render('home', { products: result });
    }
}

export default HomeController;
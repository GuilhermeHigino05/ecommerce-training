import ProductModel from "../Model/admin/ProductsModel";


class HomeController {


    public async home(req: any, res: any) {
        const products = new ProductModel(0, '', 0, 0, '', '');
        const result = await products.List();
        res.render('home', { products: result });
    }

    public async getProducts(req: any, res: any) {
        const products = new ProductModel(0, '', 0, 0, '', '');
        let id = parseInt(req.params.id)
        const result = await products.GetProduct(id)
        res.send({product: result});
    }
}

export default HomeController;
import { Request, Response } from 'express';
import ProductModel from '../../Model/admin/ProductsModel';

class ProductsController {

    public async ListView(req: Request, res: Response) {
        const product = new ProductModel(0, '', 0, '', '');
        const list = await product.List();
        res.render('admin/products/list.html', { products: list });
    }



    public async CreateView(req: Request, res: Response) {
        res.render('admin/products/create.html');
    }

    public async Create(req: Request, res: Response) {
        const { name, price, description} = req.body;
        const img = req.file;
        let ok = false;
        let msg = '';


        try {
            if (!name || !price || !description || !img) {
                res.status(400).send({ ok: false, msg: 'Dados inválidos' })
            } else {
                const imagePath = '/img/' + img.filename;
                const product = new ProductModel(0, name, price, description, imagePath);
                const result = await product.Create();
                if (result) {
                    res.status(201).send({ ok: true, msg: 'Produto cadastrado com sucesso!' })
                } else {
                    res.status(500).send({ ok: false, msg: 'Erro ao cadastrar produto!' });
                }
            }
        } catch (error) {
            res.status(500).send({ ok: false, msg: 'Erro ao cadastrar produto!' });
        }
    }
}

export default ProductsController
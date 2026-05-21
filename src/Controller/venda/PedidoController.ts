import { Request, Response } from 'express';
import ProductModel from '../../Model/admin/ProductsModel';
import PedidoModel from '../../Model/venda/PedidoModel';
//@ts-ignore
import jwt from 'jsonwebtoken'

class pedidoController {
    

    public async Create(req: Request, res: Response){
        let ok = false
        let prod = req.body
        
        for(let i = 0; i< prod.length; i++){
            let productModel = new ProductModel(prod[i].tb_pro_id,'',0,0,'','');
            let product = await productModel.GetProduct(prod[i].tb_pro_id);  
            if(product){
                if(prod[i].tb_pro_qtd <=0 || prod[i].tb_pro_qtd > product.tb_pro_qtd){
                    return res.send({ok: ok, msg: 'Quantidade inválida ou indisponível'} )
                }
                if(product.tb_pro_price != prod[i].tb_pro_price){
                    return res.send({ok: ok, msg: 'Preço inválido'});
                }

                let token = req.cookies?.token
                let tokenAdmin = req.cookies?.tokenAdmin

                let userId: number
                
                let admin =tokenAdmin? jwt.verify(tokenAdmin, process.env.SECRETTOKENTOADMIN) : false ;
                let user = token? jwt.verify(token, process.env.SECRETTOKEN) : false;
                
                let id = admin.id || user.id
                let data = Date().toString().split(' ')
                if(id){
                    let pedModel = new PedidoModel(0, data.slice(0,5).toString().replaceAll(',', ' '), prod[i].tb_pro_price * prod[i].tb_pro_qtd,  prod[i].tb_pro_qtd, id, prod[i].tb_pro_id);
                    let result = await pedModel.Create();
                    if(result){
                        return res.status(200).send({ok: true, msg: 'Pedido realizado com sucesso'});
                    }else{
                        return res.status(500).send({ok: ok, msg: 'Erro interno no servidor'});
                    }
                }else{
                    return res.status(401).send({ok: ok, msg: 'Id do usuario inválido'})
                }
            }else{
                return res.send({ok: ok, msg: 'Produto inválido'});
            }
        }
    }
}

export default pedidoController
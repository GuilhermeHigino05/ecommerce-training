
import Database from "../../Database/database";
import ProductModel from "../admin/ProductsModel";


class PedidoModel{
    private id: number;
    private date: string;
    private total: number;
    private qtd: number
    private idUser: number;
    private idProduto: number

    get Id(){return this.id} set Id(id: number){ this.id = id};
    get Date(){return this.date} set Date(date: string){ this.date = date};
    get Total(){return this.total} set Total(total: number){ this.total = total};
    get Qtd(){return this.qtd} set Qtd(qtd: number){this.qtd = qtd}


    constructor(id: number, date: string, total: number, qtd:number,  idUser: number, idProduto: number){
        this.id = id;
        this.date = date;
        this.total = total;
        this.qtd = qtd
        this.idUser = idUser;
        this.idProduto = idProduto
    }

    public async Create(){
        const sql = 'insert into tb_request(tb_request_id, tb_request_data, tb_request_total, tb_request_qtd,tb_user_tb_user_id) values (?,?,?,?,?)';
        const values = [this.id, this.date, this.total, this.qtd,this.idUser];
        const data = new Database();
        let result = await data.ExecutaComandoLastInserted(sql, values);
        let sql2 = 'insert into tb_request_has_tb_product(tb_product_tb_pro_id, tb_request_tb_request_id) values (?,?)';
        let values2 = [this.idProduto, result];
        await data.ExecutaComandoNonQuery(sql2, values2);
        let prod = new ProductModel(0,'',0,0,'','');
        await prod.RemoveQtd(this.idProduto, this.qtd);
        return result;
    }
}

export default PedidoModel
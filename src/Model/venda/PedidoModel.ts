
import Database from "../../Database/database";


class PedidoModel{
    private id: number;
    private date: string;
    private total: number;
    private idUser: number;
    private idProduto: number

    get Id(){return this.id} set Id(id: number){ this.id = id};
    get Date(){return this.date} set Date(date: string){ this.date = date};
    get Total(){return this.total} set Total(total: number){ this.total = total};


    constructor(id: number, date: string, total: number, idUser: number, idProduto: number){
        this.id = id;
        this.date = date;
        this.total = total;
        this.idUser = idUser;
        this.idProduto = idProduto
    }

    public async Create(){
        const sql = 'insert into tb_request(tb_request_id, tb_request_data, tb_request_total, tb_user_tb_user_id) values (?,?,?,?)';
        const values = [this.id, this.date, this.total, this.idUser];
        const data = new Database();
        let result = await data.ExecutaComandoLastInserted(sql, values);
        let sql2 = 'tb_product_has_tb_request(tb_product_tb_pro_id, tb_request_tb_request_id) values (?,?)';
        let values2 = [this.idProduto, result];
        await data.ExecutaComando(sql2, values2);
        return result;
    }
}

export default PedidoModel
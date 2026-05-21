
import Database from '../../Database/database.js';
import fs from 'fs'
class ProductModel{
    private id: number;
    private nome: string;
    private preco: number;
    private quantidade: number;
    private descricao: string;
    private imagem: string;



    get Id(): number{
        return this.id;
    }
    set Id(id: number){
        this.id = id;
    }
    get Nome(): string{
        return this.nome;
    } 
    set Nome(nome: string){
        this.nome = nome;
    }
    get Preco(): number{
        return this.preco;
    }
    set Preco(preco: number){
        this.preco = preco;
    }
    get Descricao(): string{
        return this.descricao;
    }
    set Descricao(descricao: string){
        this.descricao = descricao;
    }
    get Imagem(): string{
        return this.imagem;
    }
    set Imagem(imagem: string){
        this.imagem = imagem;
    }

    constructor(id: number, nome: string, preco: number,quantidade: number, descricao: string, imagem: string) {
        this.id = id;
        this.nome = nome;
        this.preco = preco;
        this.quantidade = quantidade
        this.descricao = descricao;
        this.imagem = imagem;
    }

    public async Create(){
        const sql = 'insert into tb_product (tb_pro_id, tb_pro_name, tb_pro_price, tb_pro_description, tb_pro_qtd, tb_pro_img) values (?, ?, ?, ?, ?, ?)'
        const values = [this.id,this.nome, this.preco, this.descricao, this.quantidade, this.imagem];
        const data = new Database();
        const result = await data.ExecutaComandoLastInserted(sql, values);
        return result
    }

    public async List(){
        const sql = 'select * from tb_product';
        const data = new Database();
        const result = await data.ExecutaComando(sql);
        return result;
    }

    public async Delete(id: number){
        const sql = "update tb_product set tb_pro_status = 'inativo' where tb_pro_id = ?";
        const values = [id];
        const data = new Database();
        const result = await data.ExecutaComandoNonQuery(sql, values);
        return result;
    }

    public async RemoveQtd(id: number, qtd: number){
        const sql = 'update tb_product set tb_pro_qtd = tb_pro_qtd - ? where tb_pro_id = ?'
        const values =[qtd, id];
        const data = new Database();
        const result = await data.ExecutaComandoNonQuery(sql,values);
        return result;
    }

    public async GetProduct(id: number){
        const sql = `select * from tb_product where tb_pro_id = ?`;
        const values = [id];
        const data = new Database();
        let rows = await data.ExecutaComando(sql,values);
        if(rows && rows.length>0){
            return rows[0];
        }
        return null;
    }

        toJSON() {
            return {
                id: this.id,
                tb_pro_id: this.id,
                tb_pro_name: this.nome,
                tb_pro_price: this.preco,
                tb_pro_img: this.imagem,
                descricao: this.descricao
            }
        }
}

export default ProductModel;
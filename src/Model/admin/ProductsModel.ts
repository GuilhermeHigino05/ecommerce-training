import Database from '../../Database/database.js';

class ProductModel{
    private id: number;
    private nome: string;
    private preco: number;
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

    constructor(id: number, nome: string, preco: number, descricao: string, imagem: string) {
        this.id = id;
        this.nome = nome;
        this.preco = preco;
        this.descricao = descricao;
        this.imagem = imagem;
    }

    public async Create(){
        const sql = 'insert into Product (tb_pro_id, tb_pro_name, tb_pro_price, tb_pro_description, tb_pro_img) values (?, ?, ?, ?, ?)'
        const values = [this.id,this.nome, this.preco, this.descricao, this.imagem];
        const banco = new Database();
        const result = await banco.ExecutaComandoLastInserted(sql, values);
        return result
    }

    public async List(){
        const sql = 'select * from Product';
        const banco = new Database();
        const result = await banco.ExecutaComando(sql);
        return result;
    }

    public async Delete(id: number){
        const sql = "update Product set tb_pro_status = 'inativo' where tb_pro_id = ?";
        const values = [id];
        const banco = new Database();
        const result = await banco.ExecutaComando(sql, values);
        return result;
    }


}

export default ProductModel;
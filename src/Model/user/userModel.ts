import Database from "../../Database/database";



class UserModel{
    private id?: number;
    private name?: string;
    private email?: string;
    private phone?: string;
    private password?: string;

    get Id(){ return this.id } set Id(id){ this.id = id }
    get Name(){ return this.name } set Name(name){ this.name = name }
    get Email(){ return this.email } set Email(email){ this.email = email }
    get Phone(){ return this.phone } set Phone(phone){ this.phone = phone }
    

    constructor(id: number, name: string, email: string, phone: string, password: string){
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.password = password;
    }

    public async Register(){
        const sql = 'insert into tb_user(tb_user_name, tb_user_email, tb_user_phone, tb_user_password) values(?,?,?,?)'
        const values = [this.name, this.email, this.phone, this.password];
        const database = new Database();
        const result = await database.ExecutaComandoLastInserted(sql, values);
        return result;
    }

    public async GetUser(id: number){
        const sql = 'select * from tb_user where tb_user_id = ?';
        const values = [id];
        const database = new Database();
        const result = database.ExecutaComando(sql,values);
        return result;
    }
    public async Login(name: string, email: string){
        const sql = 'select * from tb_user where tb_user_name = ? and tb_user_email = ?';
        const values = [name, email];
        const database = new Database();
        const result = await database.ExecutaComando(sql,values);
        if(result.length == 0){
            return false;
        }else{
            return result[0];
        }
    }
}

export default UserModel;
import mysql from 'mysql2';

class Database {

    #conexao;

    get conexao() { return this.#conexao;} 
    set conexao(conexao) { this.#conexao = conexao; }

    constructor() {

        this.#conexao = mysql.createPool({
            host: process.env.DB_HOST, //endereço do nosso banco de dados na nuvem
            database: process.env.DB_NAME, //a database de cada um de vocês possui a nomenclatura PFS1_(RA)
            user: process.env.DB_USER, // usuario e senha de cada um de vocês é o RA
            password: process.env.DB_PASSWORD,
            waitForConnections: true,
            connectionLimit: 100, // Limite de conexões
            queueLimit: 0 // Sem limite na fila de conexões
        });
        
    }

    ExecutaComando(sql, valores) {
        var cnn = this.#conexao;
        return new Promise(function(res, rej) {
            cnn.query(sql, valores, function (error, results, fields) {
                if (error) 
                    rej(error);
                else 
                    res(results);
            });
        })
    }
    
    ExecutaComandoNonQuery(sql, valores) {
        var cnn = this.#conexao;
        return new Promise(function(res, rej) {
            cnn.query(sql, valores, function (error, results, fields) {
                if (error) 
                    rej(error);
                else 
                    res(results.affectedRows > 0);
            });
        })
    }

    ExecutaComandoLastInserted(sql, valores) {
        var cnn = this.#conexao;
        return new Promise(function(res, rej) {
            cnn.query(sql, valores, function (error, results, fields) {
                if (error) 
                    rej(error);
                else 
                    res(results.insertId);
            });
        })
    }

}

export default Database;




var MySqlDB = require(`./MySqlDB`);

class MySqlPool {
    
    createMysqlPoolConnection(db){
        var sqlDB = new MySqlDB();
        return sqlDB.connect(db);
    }
}

 module.exports = new MySqlPool();
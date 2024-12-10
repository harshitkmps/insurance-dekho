var mysql      = require('mysql');
var masterPool = null;
var slavePool = null;

class MySqlDB {
    
    createPool(type){
        return new Promise(function(resolve, reject){
            try {
                var pool = mysql.createPool({
                    connectionLimit : (config.db.limit) ? config.db.limit : 50,
                    host            : config.db.host,
                    user            : config.db.user,
                    password        : config.db.password,
                    database        : config.db.database
                });

                if(type == 'master'){
                    masterPool = pool;
                    return resolve(masterPool);
                } else if(type == 'slave'){
                    slavePool = pool;
                    return resolve(slavePool);
                }
            } catch(e) {
                reject(e);
            }
            
        });
    }
    
    connect(type){
        try {
            return this.createPool(type);
        } catch(e) {
            console.log(e);
        }
    }
    
    query(sql, params, ConnName){
        let connection = (ConnName == 'MYSQL_HEALTH_SLAVE') ? slavePool : masterPool;
        return new Promise(function(resolve, reject){
            if(params){
                return connection.query(sql, params, function(err, result){
                    if(err){
                        return reject(err);
                    }
                    return resolve(result);            
                });
            }else{
                return connection.query(sql, function(err, result){        
                    if(err){
                        return reject(err);
                    }
                    return resolve(result);            
                });
            }
            
        })
    }
}

module.exports = MySqlDB;

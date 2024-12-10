var mysql       = require('mysql');
var mongoose    = require('mongoose');
var presto      = require('presto-client');
var Promise     = require("bluebird");
const _ = require('lodash');

var CommonHelper = require('./CommonHelper');
const { resolve, reject } = require('bluebird');

let prestoConOpt = {
    "host": config.presto.host
};
var client = new presto.Client(prestoConOpt);

const poolEnabledDBSource = ['itms', 'pos', 'central'];
const nonNativeMongoDBSource = ['travel', 'healthLmwDB', 'motorLmwDB'];
var pooledConnections = {
    itms: null,
    pos: null,
    central: null,
};

Promise.promisifyAll(mongoose);

module.exports = {

    executeQuery: function (query, dbType, dbSource) {
        let that = this;
        if (_.includes(poolEnabledDBSource, dbSource)) {
            // execute query with pools
            let connectionPool = pooledConnections[dbSource];
            if (connectionPool == null) {
                console.log(`pool not found for dbsource ${dbSource}. creating pool`);
                // create pool connection
                connectionPool = mysql.createPool({
                    connectionLimit: 10,
                    host: config[dbSource].db.host,
                    user: config[dbSource].db.user,
                    password: config[dbSource].db.password,
                    database: config[dbSource].db.database
                });
                pooledConnections[dbSource] = connectionPool;
            }
            console.log(`polling data from dbpool ${dbSource} query ${JSON.stringify(query)}`);
            // execute pool query
            return new Promise(function (resolve, reject) {
                return connectionPool.query(query, function (err, result) {
                    if (err) {
                        console.log(`error in querying from db pool ${JSON.stringify(err)}`);
                        return reject(err);
                    }
                    return resolve(result);
                });
            });
        } else {
            return new Promise(async function (resolve, reject) {
                try {
                    let result = false;
                    let connection = await that.getConnection(dbType, dbSource);
                    if (dbType == 'mysql') {
                        result = await connection.queryAsync(query);
                        connection.end((err) => { });
                    } else if (dbType == 'mongodb') {
                        result = await eval(query);
                        await connection.close();
                        console.log("Mongo Db connection ended.");
                    }
                    resolve(result);
                } catch (e) {
                    console.log(e);
                    reject(e);
                }
            });
        }
    },

    getConnection: function (dbType, dbSource) {
        let that = this;
        return new Promise(async function (resolve, reject) {            
            try {
                if(config.hasOwnProperty(dbSource)){
                    let connection = false;
                    if(dbType == 'mysql'){
                        if(config[dbSource].db){
                            dbConfig = config[dbSource].db;
                            connection = await that.getMySqlConnection(dbConfig);
                        }else{
                            throw ERROR.DATABASE_CONFIGURATION_NOT_FOUND;
                        }
                    }else if(dbType == 'mongodb'){
                        if(config[dbSource].mongodb){
                            dbConfig = config[dbSource].mongodb;
                            let isNative = _.includes(nonNativeMongoDBSource, dbSource) ? false : true;
                            connection = await that.getMongoDBConnection(dbConfig, isNative);
                        }else{
                            throw ERROR.DATABASE_CONFIGURATION_NOT_FOUND;
                        }
                    }else{
                        throw ERROR.INVALID_DB_TYPE;
                    }
                    resolve(connection);
                }else{
                    throw ERROR.INVALID_DATA_SOURCE;
                }
            } catch (e) {
                reject(e);
            }
        });
    },

    getMySqlConnection: function (dbConfig) {
        return new Promise(async function (resolve, reject) {
            try {
                let connection = mysql.createConnection({
                        host     : dbConfig.host,
                        user     : dbConfig.user,
                        password : dbConfig.password,
                        database : dbConfig.database
                    });

                connection.connect(function(err) {
                    if (err) {
                        console.error(`error connecting with mysql db:${dbConfig.host} error:${JSON.stringify(err)} `);
                        throw err;
                    }
                    console.log('db: MySQL is connected: '+dbConfig.host);
                });

                Promise.promisifyAll(connection);
                resolve(connection);

            } catch (e) {
                reject(e);
            }
        });
    },

    getMongoDBConnection: function (dbConfig, isNative = true) {
        return new Promise(async function (resolve, reject) {
            try {
                var options = {
                    auto_reconnect: true,
                    reconnectTries: Number.MAX_VALUE,
                    reconnectInterval: 1000,
                    keepAlive: 1,     
                    bufferMaxEntries: 0, // If not connected, return errors immediately rather than waiting for reconnect
                    useNewUrlParser: true 
                };
                console.log(dbConfig)
                if (!isNative) {
                    resolve(mongoose.createConnection(dbConfig.uri, options));
                }
                mongoose.connect(dbConfig.uri, options, function(err, db){
                    if(err){
                        throw err;
                    }
                    // global.db = db;  
                });

                mongoose.connection.on('error', function(err){
                    console.log("db: mongodb error " + e);
                    throw err;
                    // reconnect here
                });

                mongoose.connection.on('connected', function(err){
                    console.log('db: mongodb is connected: ' + config.mongodb.uri);
                });

                mongoose.connection.on('disconnected', function(){
                    console.log('db: mongodb is disconnected');
                });

                mongoose.connection.on('reconnected', function(){
                    console.log('db: mongodb is reconnected: ' + config.mongodb.uri);
                });

                mongoose.connection.on('timeout', function(err) {
                    console.log("db: mongodb timeout "+err);
                    throw err;
                    // reconnect here
                });

                mongoose.connection.on('close', function(){
                    console.log('db: mongodb connection closed');
                });

                //mongoose.set('bufferCommands', false);
                
                // console.log(await mongoose.connection.collection('tp_api_log').find().toArray())
                resolve(mongoose.connection);
            } catch (e) {
                reject(e);
            }
        });
    },

    executePrestoDBQuery: function (query) {
        return new Promise(async function (resolve, reject) {
            try {
                console.log(client);
                let rows = [];
                client.execute({
                    query:   query,
                    // catalog: 'mysql',
                    // schema:  'policy_reader',
                    source:  'nodejs-client',
                    // state: function(error, query_id, stats){ 
                    //     console.log({message:"status changed", id:query_id, stats:stats}); 
                    // },
                    // columns: function(error, data){ 
                    //     console.log({resultColumns: data}); 
                    // },
                    data: function(error, data, columns, stats){
                        if(!error){
                            if(!CommonHelper.isEmpty(data)){
                                for(i = 0; i < data.length; i++){
                                    let row = {};
                                    for(key = 0; key < columns.length; key++){
                                        row[columns[key].name] = data[i][key];
                                    }
                                    rows.push(row)
                                }
                            }
                        }
                    },
                    success: function(error, stats){                       
                        if(!error){
                            if(stats.state = 'FINISHED'){
                                resolve(rows)
                            }
                        }else{
                            reject(error);
                        }
                        console.log(stats)
                    },
                    error: function(error){
                        console.log(error)
                        reject(error);
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    },

    executeFunctionByName: function(functionNames, obj) {
        try{
            var namespaces = functionNames.split(".");
            console.log(namespaces)
            for(var i = 0; i < namespaces.length; i++) {
                let functionName = '';
                let argString = '';
                if(namespaces[i].indexOf('(') > 0 && namespaces[i].indexOf(')') > 0){
                    argString = namespaces[i].substring(
                        namespaces[i].indexOf("(") + 1, 
                        namespaces[i].lastIndexOf(")")
                    );   
                            
                    functionName = namespaces[i].replace(argString, "");
                    functionName = functionName.replace("()", "");

                    // if(CommonHelper.isJsonString(argString)){
                    //     console.log('hi')
                    //     argString = JSON.parse(argString);
                    //     console.log(argString)
                    // }
                   
                    if((argString.startsWith("'") || argString.startsWith('"')) && (argString.endsWith("'") || argString.endsWith('"'))){
                        argString = argString.substring(1, argString.length - 1)
                    }

                    if(argString != '' && !isNaN(argString)){
                        argString = parseInt(argString);
                    }
                                        
                    console.log(functionName+' : '+argString)
                }
                if(functionName){
                    if(argString){
                        obj = obj[functionName](argString);
                    }else{
                        obj = obj[functionName]();
                    }
                }
            }       
            return obj;
        }catch(e){
            console.log(e);
        }
    }
}

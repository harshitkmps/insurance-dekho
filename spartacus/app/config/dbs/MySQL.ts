/**
 * Author   - Ankit Shukla
 * module   - creating and managing mysql db connection  
 */

const mysql = require('mysql');
import dbConfig from "./Config";
import logger from "@config/services/WinstonConfig";

let masterPool: any, slavePool: any;

// used for creating db pool.
const createPool = (dbType = 'MASTER') => {
    try {
        logger.info(`"${dbType}" DB Pool created...`);
        return mysql.createPool(dbConfig.MYSQL[dbType as keyof typeof dbConfig.MYSQL]);
    }
    catch {
        throw { error: `Error in creating "${dbType}" mysqldb pool connection !!` };
    }
}

// used to perform queries on database
const executeQuery = async (sql: any, type: any, params: any) => {
    const connection = (type === 'SLAVE') ? slavePool : masterPool;
    return new Promise(function (resolve, reject) {
        return connection.query(sql, params, function (err: any, result: any) {
            if (err) {
                return reject(err);
            }
            return resolve(result);
        });
    })
}

// testing connection
const checkDBConnection = (dbPool: any, poolType: any) => {
    dbPool.getConnection((err: any, connection: any) => {
        if (err) logger.error(`unable to connect to ${poolType} DB.`);
        else logger.info(`${poolType} DB Connected...`)
        return connection;
    })
}

export default { createPool, checkDBConnection, executeQuery };
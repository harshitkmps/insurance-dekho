/**
 * Author : Ankit Shukla
 * Module to connect to mongodb and perform query
 */

// below comment states that this file is ignored during testing using jest
/* istanbul ignore file */

import mongoose from 'mongoose';
let mongoLogger: any;
let mongoDatabase: any;
let connectionStrings = '';
import logger from '@config/services/WinstonConfig';

import _ from 'lodash';
import dbConfig from '@db/Config';
import NewRelicHelper from '@app/utils/helpers/NewRelicHelper';
import { NewRelicEventTypes } from '@app/enums/NewRelicEventTypes';

// generate connection string from config
const connectionString = (connection: any) => {
    const dbName = connection['DB'];
    if(_.last(process.argv)==='ignore-db') return "";
    let connectionString = `mongodb://${connection['USER']}:${connection['PASSWORD']}@${connection['HOST']}:${connection['PORT']}`;
    let replicas: any = [];
    let params: any = [];
    if (connection['REPLICA']) {
        for (const RKey in connection['REPLICA']) {
            replicas.push(`${connection['REPLICA'][RKey]['HOST']}:${connection['REPLICA'][RKey]['PORT']}`);
        }
    }
    if (replicas.length) {
        connectionString = `${connectionString},${replicas.join(',')}`;
    }
    connectionString += `/${dbName}`;
    if (typeof connection['SSL'] != 'undefined') {
        params.push(`ssl=${connection['SSL']}`)
    }
    if (connection['AUTH_SOURCE']) {
        params.push(`authSource=${connection['AUTH_SOURCE']}`)
    }
    if (replicas.length) {
        params.push(`replicaSet=${(connection['REPLICA_NAME']) ? connection['REPLICA_NAME'] : 'repl1'}`)
    }
    if (params.length) {
        connectionString = `${connectionString}?${params.join('&')}`;
    }

    return connectionString;
}

// connect to mongodb using generated  connection string
const connect = (connectionConfig: any, connectionType: any) => {
    connectionStrings = connectionString(connectionConfig);
    if(_.isEmpty(connectionStrings)) return;
    logger.info(connectionStrings);
    const connection = mongoose.createConnection(connectionStrings, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, autoIndex: false });
    
    connection.on("open", (ref: any) => {
        logger.info(`Connected to "${connectionType}" database.`);
    });

    connection.on("error", (err: any) => {
        NewRelicHelper.emitCustomEvent(NewRelicEventTypes.MongoError, {});
        logger.error(`Could not connect to "${connectionType}" server`);
    });

    connection.on("reconnected", () => {
        NewRelicHelper.emitCustomEvent(NewRelicEventTypes.MongoReconnect, {});
        logger.info(`connection "${connectionType}" reconnected!`);
    });

    connection.on("disconnected", (err: any) => {
        NewRelicHelper.emitCustomEvent(NewRelicEventTypes.MongoDisconnect, {});
        logger.warn(`connection "${connectionType}" disconnected!`);
    });
    return connection;
}

const createConnection = (connectionType: any) => {
    const connectionConfig = dbConfig.MONGO[connectionType as keyof typeof dbConfig.MONGO];
       return connect(connectionConfig, connectionType);
}

// mongoLogger= createConnection('LOGGER');
mongoDatabase = createConnection('MAIN');

export default { mongoLogger, mongoDatabase, connectionStrings };
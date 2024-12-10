/**
 * Created By Vijay Maurya <vijay.maurya@girnarsoft.com>
 * Timestamp 03/10/19 11:24
 */

import mongoose = require("mongoose");
import { C } from "../constants/constants";
import mongoDB = require("mongodb");
let connection: any = null;
import {ResponseFormatter} from "../../lib/ResponseFormatter";
import { MessagesConstants as msgC } from "../constants/messages.constants";

// let winston = require('winston');

export class MongoDB {

    constructor() {

        const mongooseOptions = {

            useNewUrlParser: true,
            useFindAndModify: false,
            auto_reconnect: true,
            connectTimeoutMS: 3600000,
            autoIndex: true,
            socketTimeoutMS: 3600000,   // Close sockets after 5 seconds of inactivity
            useUnifiedTopology: true,
        };

        const mongoURI: string = this.getDBConnection();
        const mongoDb = mongoose.connect(mongoURI, mongooseOptions);
        mongoose.set("useCreateIndex", true);
    }

    public async connectToNativeMongoDB() {
        try {
            if (connection) {
                return Promise.resolve(connection);
            } else {
                connection = await mongoDB.MongoClient.connect(new MongoDB().getDBConnection(), { useUnifiedTopology: true });
                return Promise.resolve(connection);
            }
        } catch (e) {
            const error = ResponseFormatter.getErrorResponseWithBody(500, "CNN000", msgC.SOMETHING_WENT_WRONG, msgC.SOMETHING_WENT_WRONG);
            connection = null;
            return Promise.reject(error);
        }
    }

    private getDBConnection(): string {
        let mongodbConnectionString = "";
        if (!C.mongoDBConfig.authSource) {

            mongodbConnectionString = "mongodb://" + (C.mongoDBConfig.host).join() + "/" + C.mongoDBConfig.dbName;
        } else {

            mongodbConnectionString = "mongodb://" + C.mongoDBConfig.username + ":" +
                C.mongoDBConfig.password + "@" + (C.mongoDBConfig.host).join() + "/" + C.mongoDBConfig.dbName +
                "?ssl=false&authSource=" + C.mongoDBConfig.authSource;

            if (C.mongoDBConfig.replicaSetName) {
                mongodbConnectionString += "&replicaSet=" + C.mongoDBConfig.replicaSetName;
            }
        }
        return mongodbConnectionString;
    }

}

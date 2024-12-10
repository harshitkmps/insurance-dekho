import Mongo from "@app/config/dbs/Mongo";
import { redash } from "@app/interfaces/redash";
import { Schema } from "mongoose";

const redashSchema = new Schema<redash>({
    'requestType': String, 
    'cost': Number, 
    'statusCode': Number,
    'created_at': {type: Date, default: Date.now, index: true}, 
    'updated_at': {type: Date, default: Date.now} 
});

const RedashModel = Mongo.mongoDatabase.model('redash', redashSchema);

export default RedashModel;
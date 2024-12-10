import { Document, model, Schema } from "mongoose";

export interface ILogging extends Document {

    endPoint: string;
    httpMethod: string;
    header: Schema.Types.Mixed;
    body: Schema.Types.Mixed;
    statusCode: number;
    callDuration: number;

}

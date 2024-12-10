import { Document, model, Schema } from "mongoose";
import { ILogging } from "../../interfaces/logging/ILogging";

const LoggingModelSchema: Schema = new Schema(
    {
        endpoint: String,
        httpMethod: String,
        header: Schema.Types.Mixed,
        body: Schema.Types.Mixed,
        callDuration : Number,
        statusCode : Number,
    },
    {
        collection: "api_log", timestamps: true,
    },
);

export const LoggingModel = model<ILogging>("LoggingModel", LoggingModelSchema);

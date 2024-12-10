/**
 * Author - Ankit Shukla
 * Module - Used for generating internal error logs
 */
import storageHelper from "@helpers/StorageHelper";
import logger from "@app/config/services/WinstonConfig";

/**
  * A Schema is a JSON object that defines the the structure and contents of your data.
  */

export default class errorLogModel {

    public static async generateErrorLog (err: any) {
        const x_correlation_id = await storageHelper.getCorrelationId();
        const metaData = await storageHelper.getMetaData();
        const stackTraceData = await storageHelper.getStackTraceData();
        err = { ...err, ...x_correlation_id, ...metaData, ...stackTraceData };
        logger.error(`error log ${JSON.stringify(err)}`);
        return;
    }
}
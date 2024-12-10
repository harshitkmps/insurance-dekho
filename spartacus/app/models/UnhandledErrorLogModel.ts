/**
 * Author - Ankit Shukla
 * Module - Used for generating unhandled logs
 */
import storageHelper from "@helpers/StorageHelper";
import logger from "@app/config/services/WinstonConfig";

  /**
   * A Schema is a JSON object that defines the the structure and contents of your data.
   */

export default class unhandledErrLogModel {

    public static async generateUnhandledErrorLog (payload: any) {
        const metaData = await storageHelper.getMetaData();
        const x_correlation_id = await storageHelper.getCorrelationId();
        payload = { ...payload, ...x_correlation_id, ...metaData };
        logger.error(`unhandled error log ${JSON.stringify(payload)}`);
        return;
    };
}
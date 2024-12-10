/**
 * Author - Ankit Shukla
 * Module - Used for generating tp logs
 */
import storageHelper from "@helpers/StorageHelper";
import logger from "@app/config/services/WinstonConfig";

/**
 * A Schema is a JSON object that defines the the structure and contents of your data.
 */

export default class tpApiLogModel {

    public static async generateTpApiLog (payload: any) {
        const metaData = await storageHelper.getMetaData();
        const x_correlation_id = await storageHelper.getCorrelationId();
        const stackTraceData = await storageHelper.getStackTraceData();
        payload = { ...payload, ...x_correlation_id, ...metaData, ...stackTraceData };
        logger.info(`tp api log ${JSON.stringify(payload)}`);
        return;
    };
}




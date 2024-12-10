/**
 * Author - Ankit Shukla
 * Module - Used for generating internal logs
 */
import storageHelper from "@helpers/StorageHelper";
import logger from '@config/services/WinstonConfig';

/**
 * A Schema is a JSON object that defines the the structure and contents of your data.
 */

export default class loggerModel {

    constructor() {
    }

    public static async generateApiLog (payload: any) {
        const x_correlation_id = await storageHelper.getCorrelationId();
        const metaData = await storageHelper.getMetaData();
        const stackTraceData = await storageHelper.getStackTraceData();
        payload = { ...payload, ...x_correlation_id, ...metaData, ...stackTraceData };
        logger.info(`api log ${JSON.stringify(payload)}`);
        return;
    }
}
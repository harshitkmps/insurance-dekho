/**
 * Author - Ankit Shukla
 * Module - Used for generating internal logs
 */
import errLogModel from '@models/ErrorLogModel';
import tpApiLogModel from '@models/TpApiLogModel';
import logger from '@config/services/WinstonConfig';

export default class tpApiLogService {

    public static async generateTpApiLog (data: any) {
        try {
            return await tpApiLogModel.generateTpApiLog(data);
        } catch (err) {
            logger.error(`Error in generateTpApiLog : ${err}`);
            err = { ...data, ...{ error: err } };
            return await errLogModel.generateErrorLog(err);
        }
    };
};
/**
 * Author - Ankit Shukla
 * Module - Used for generating internal logs
 */

import logger from '@config/services/WinstonConfig';
import loggerModel from '@models/LoggerModel';
import errLogModel from '@models/ErrorLogModel';
import CommonHelper from '@helpers/CommonHelper';
import unhandledErrLogModel from '@models/UnhandledErrorLogModel';

export default class loggerService {

    public static async generateApiLog (data: any) {
        try {
            return loggerModel.generateApiLog(data);
        } catch (err) {
            logger.error(`Error in generateApiLog : ${err}`);
            return;
        }
    };

    public static generateErrorLog (err: any) {
        err = {...err, ...{ created_at : CommonHelper.getDateTime() } };
        try {
            return  errLogModel.generateErrorLog(err);
        } catch (error) {
            logger.error(`Error in generateErrorLog : ${error}`);
            error = { ...err, ...{ error: error } };
            return unhandledErrLogModel.generateUnhandledErrorLog(error);
        }
    };

    public static async generateUnhandledErrorLog (err: any) {
        const error = { ...err, ...{ created_at : CommonHelper.getDateTime() } };
        return unhandledErrLogModel.generateUnhandledErrorLog(error);
    }
};

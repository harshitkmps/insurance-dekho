/**
 * Author - Ankit Shukla
 * Module - Used for generating internal logs
 */

import CommonHelper from '@helpers/CommonHelper';
import loggerService from '@services/LoggerService';

export default class LoggerController {
    
    static generateApiLog = async (req: any, res: any, result: any) => {
        try {
            const currentTime = CommonHelper.getDateTime();
            const reqObj = {
                url         : req.originalUrl,
                method      : req.method,
                headers     : req.headers,
                query       : req.query,
                body        : req.body,
                response    : result,
                created_at  : currentTime,
                updated_at  : currentTime,
            }
            return await loggerService.generateApiLog(reqObj);
        } catch (err) {
            return await loggerService.generateErrorLog(err);
        }
    };
    
    static generateErrorLog = async (req: any, res: any, result: any) => {
        try {
            const data = {
                url         : req.originalUrl,
                method      : req.method,
                headers     : req.headers,
                query       : req.query,
                body        : req.body,
                error       : result,
                created_at  : CommonHelper.getDateTime(),
            }
            return await loggerService.generateErrorLog(data);
        } catch (err) {
            return await loggerService.generateUnhandledErrorLog(err);
        }
    };
    
    static generateUnhandledErrorLog = async (err: any) => {
        const data = {
            error       : err,
            created_at  : CommonHelper.getDateTime(),
        }
        return await loggerService.generateUnhandledErrorLog(data);
    }
};

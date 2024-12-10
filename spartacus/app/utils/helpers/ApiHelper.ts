/**
 * Author   -   Ankit Shukla
 */

import axios from "axios";
import CommonHelper from "@helpers/CommonHelper";
import tpApiLogger from "@services/TpApiLogService";
import logger from "@config/services/WinstonConfig";
import RedashLoggerService from "@app/redashLogger/service/RedashLoggerService";

const httpRequest = async (request: any) => {
    let data: any = {};

    // preparing data to request
    try {
        JSON.parse(request.payload);
        data = JSON.stringify(request.payload);
    }
    catch (err) {
        logger.warn('warning in httpRequest');
        data = request.payload;
    }

    // preparing request
    const req = {
        url     : request.url,
        method  : request.method ? request.method : "POST",
        data    : request.body ? request.body : {},
        params  : request.query ? request.query : {},
        headers : (request.headers) ? request.headers : { 'Content-Type': 'application/json' },
        timeout : (request.timeout) ? request.timeout : 5000,
    }
  
    // send request
    let APIResponse: any;
    let error: any;

    try {
        if(Object.keys(req.data).length == 0)
            delete req.data;
        APIResponse = await axios.request(req);
        createTpLog({...req,...{ "response" : APIResponse}});
    }
    catch (err: any) {
        error = err;
        createTpLog({...req,...{ "error": err?.response?.data}});
        throw err?.response?.data;
    } finally {
        RedashLoggerService.insertRedashLog(req, APIResponse, error);
    }
    return APIResponse.data;
};

// generating logging for tp api calls
const createTpLog = async (request: any) => {
    try {
        const currentTime = CommonHelper.getDateTime();
        const log = {
            url         : request.url ? request.url : "",
            method      : request.method,
            headers     : request.headers,
            params      : request.params,
            body        : (request && request.data) ? request.data : "",
            response    : request.response ? request.response.data : "",
            error       : request.error ? request.error : "",
            created_at  : currentTime,
            updated_at  : currentTime,
        }

        // generate tp api log
        let logData: any;
        logData = await tpApiLogger.generateTpApiLog(log);
        return logData;
    } 
    catch (err) {
        throw err;
    }
}

export default  {
  httpRequest,
}
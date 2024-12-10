import { Request, Response } from "express";
import moment = require("moment-timezone");
import { configure } from "winston";
import _ = require("lodash");
import { C } from "../../../config/constants/constants";
moment.tz.setDefault(C.TIMEZONE);
import { LoggingModel } from "../../models/logging/LoggingModel";
import { ConfigurationHelper } from "../../../helper/configurationHelper";
import { Utils } from "../../../lib/Utils";
export class LoggingService {

    constructor() {

    }

    public async createApiLog(req: Request, res: Response, params: object = {}) {

        try {
            let logParams: any = {};
            let isResponse: boolean = false;
            const configuration: any = await ConfigurationHelper.getApiGatewayConfiguration();
            const middlewares = configuration ? configuration.middlewares : {};

            if (middlewares && middlewares.Logging) {
                if (Utils.isEmpty(params)) {
                    logParams = middlewares.Logging.level.request;
                    res.locals.reqTime = +new Date();
                } else {
                    logParams = middlewares.Logging.level.response;
                    logParams.resEndPoint = res.__path;
                    logParams.resBody = true;
                    res.locals.resTime = +new Date();
                    isResponse = true;
                }
            }
            const apiLogM = new LoggingModel(this.getLog(req, res, logParams, isResponse));
            const savedLog: any = await apiLogM.save();
            return Promise.resolve(savedLog);
        } catch (err) {
            return Promise.reject(err);
        }

    }

    public async createResponseLog(req: Request, res: Response, params: object = {}) {

        try {
            let logParams: any = {};
            let isResponse: boolean = false;
            const configuration: any = await ConfigurationHelper.getApiGatewayConfiguration();
            const middlewares = configuration ? configuration.middlewares : {};

            if (middlewares && middlewares.Logging) {
                    logParams = middlewares.Logging.level.response;
                    logParams.resEndPoint = res.__path;
                    logParams.resBody = true;
                    res.locals.resTime = +new Date();
                    isResponse = true;
            }
            const apiLogM = new LoggingModel(this.getResponseLog(req, res, logParams, isResponse));
            const savedLog: any = await apiLogM.save();
            return Promise.resolve(savedLog);
        } catch (err) {
            return Promise.reject(err);
        }

    }

    private getLog(req: Request, res: Response, logParams: any, isResponse: boolean) {
        const log: any = {};

        if (logParams.endpoint) {
            log.endpoint = logParams.resEndPoint ? logParams.resEndPoint : req.protocol + "://" + req.get("host") + req.originalUrl;
        }
        if (logParams.header) {
            log.header = isResponse ? res.getHeaders() : !Utils.isEmpty(req.headers) ? req.headers : "{}";
        }
        if (logParams.body) {
            log.body = logParams.resBody ? (res.__body || "{}")  : (!Utils.isEmpty(req.body) ? req.body : "{}");
        }
        if (logParams.httpMethod) {
            log.httpMethod = req.method;
        }
        if (logParams.statusCode) {
            log.statusCode = res.statusCode;
        }
        if (logParams.callDuration && res && res.locals && res.locals.resTime && res.locals.reqTime) {
            log.callDuration = res.locals.resTime - res.locals.reqTime;
        }
        return log;
    }

    private getResponseLog(req: Request, res: Response, logParams: any, isResponse: boolean) {
        const log: any = {};

        if (logParams.endpoint) {
            log.endpoint = logParams.resEndPoint ? logParams.resEndPoint : req.protocol + "://" + req.get("host") + req.originalUrl;
        }
        if (logParams.header) {
            log.header = isResponse ? res.getHeaders() : !Utils.isEmpty(req.headers) ? req.headers : "{}";
        }
        if (logParams.body) {
            log.body = logParams.resBody ? (res.__body || "{}")  : (!Utils.isEmpty(req.body) ? req.body : "{}");
        }
        if (logParams.httpMethod) {
            log.httpMethod = req.method;
        }
        if (logParams.statusCode) {
            log.statusCode = res.statusCode;
        }
        if (logParams.callDuration && res && res.locals && res.locals.resTime && res.locals.reqTime) {
            log.callDuration = res.locals.resTime - res.locals.reqTime;
        }
        return log;
    }

}

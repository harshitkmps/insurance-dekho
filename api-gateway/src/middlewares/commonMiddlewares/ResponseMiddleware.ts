import { NextFunction, Request, Response } from "express";
import moment = require("moment-timezone");
import { C } from "../../config/constants/constants";
import { Utils } from "../../lib/Utils";
moment.tz.setDefault(C.TIMEZONE);
import { MessagesConstants as Msg } from "../../config/constants/messages.constants";
import { ResponseFormatter } from "../../lib/ResponseFormatter";
import { LoggingMiddleware } from "../groupMiddlewares/LoggingMiddleware";

export class ResponseMiddleware {

    public static sendResponse(response: any, req: Request, res: Response, next: NextFunction) {

        if (response.isSuccess) {
            ResponseMiddleware.success(req, res, response.data, response.version);
        } else {
            const error: any = response && response.data ? response.data : response instanceof Error ? response.message : response;
            ResponseMiddleware.fail(req, res, error);
        }
    }

    public static success(req: Request, res: Response, data: any, version: string = C.apiResponseVersion.v1) {
        let httpStatusCode: number;

        try {
            LoggingMiddleware.logApiResponse(req, res, { response: "success" });
            httpStatusCode = data.statusCode || 200;
        } catch (err) {
            const errResponse: any = ResponseFormatter.getErrorResponseWithBody(500, "RF001", Msg.SOMETHING_WENT_WRONG, {});
            data = errResponse.body;
            httpStatusCode = errResponse.status;
        }
        console.log("Response Timestamp:", moment().format());
        const responseBody: any = this.getResponseBody(req, data, version);
        // this.setResponseHeaders(req, res, data);
        res.status(httpStatusCode).send(responseBody);
    }

    public static fail(req: Request, res: Response, error: any, refId?: string) {

        let data: any;
        let status: number;

        try {
            let loggedError = {};

            if (!Utils.isEmpty(error) && !Utils.isEmpty(error.loggedError)) {
                loggedError = error.loggedError;
                delete error.loggedError;
            }

            const newParams = { response: error, loggedError, refId };
            res.__responseData = newParams;
            LoggingMiddleware.logApiResponse(req, res, newParams);

            if (!Utils.isEmpty(error) && !Utils.isEmpty(error.status)) {
                data = error.body;
                status = error.status;
            } else {
                const errResponse: any = ResponseFormatter.getErrorResponseWithBody(500, "RF002", "Something Went Wrong", error);
                data = errResponse.body;
                status = errResponse.status;
            }
        } catch (err) {
            const errResponse: any = ResponseFormatter.getErrorResponseWithBody(500, "Something Went Wrong", "RF003", err);
            data = errResponse.body;
            status = errResponse.status;
        }
        console.log("Response Timestamp:", moment().format());
        res.status(status).send({ errors: data });
    }

    public static getResponseBody(req: Request, data: any, version: string) {
        if (version && version === C.apiResponseVersion.v1) {
            return {data : data.body};
        } else {
            return data.body;
        }
    }

    public static setResponseHeaders(req: Request, res: Response, data: any) {
        if (data && data.thirdPartyResponse && data.thirdPartyResponse.headers && data.thirdPartyResponse.headers["content-type"]) {
            res.setHeader("content-type", data.thirdPartyResponse.headers["content-type"]);
        }
    }

    constructor() {

    }
}

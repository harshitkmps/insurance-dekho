import { NextFunction, Request, Response } from "express";
import moment = require("moment-timezone");
moment.tz.setDefault("Asia/Calcutta");

import { LoggingService } from "../../core/services/logging/LoggingService";

export class LoggingMiddleware {

    public static async execute(req: Request, res: Response, next: NextFunction, middlewareProperties: any) {
        console.log("*************** Logging MiddleWare ***************");

        const apiLogService: LoggingService = new LoggingService();
        const logData: any = await apiLogService.createApiLog(req, res);
        next();
    }

    public static async logApiResponse(req: Request, res: Response, params: any) {

        const apiLogService: LoggingService = new LoggingService();
        await apiLogService.createApiLog(req, res, params);
    }

    constructor() {

    }
}

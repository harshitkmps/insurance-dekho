import { NextFunction, Request, Response } from "express";
import moment = require("moment-timezone");
moment.tz.setDefault("Asia/Calcutta");
import { ConfigurationHelper } from "../../helper/configurationHelper";
import { v4 as uuidv4 } from "uuid";
export class CorrelationIdGeneratorMiddleware {

    public static async execute(req: Request, res: Response, next: NextFunction, middlewareProperties: any) {
        console.log("*************** CorrelationIdGenerator MiddleWare ***************");

        const configuration: any = await ConfigurationHelper.getApiGatewayConfiguration();
        const urlGroupDetails: any = await ConfigurationHelper.getUrlGroup(req);
        const urlGroup: string = urlGroupDetails.urlGroup;
        const middleware = configuration.groupMiddlewareMapping[urlGroup].CorrelationIdGenerator;

        if (!req.headers[middleware.header]) {
            req.headers[middleware.header] = uuidv4();
        }

        next();
    }

    constructor() {

    }
}

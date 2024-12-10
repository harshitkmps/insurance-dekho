import { NextFunction, Request, Response } from "express";
import { Utils } from "../../lib/Utils";
import { RedisClient } from "../../config/database/redisClient";
import { ConfigurationHelper } from "../../helper/configurationHelper";
import { ResponseFormatter } from "../../lib/ResponseFormatter";

import async = require("async");
import { MiddlewareIndexer } from "./MiddlewareIndexer";

export async function configurableMiddleware(req: Request, res: Response, next: NextFunction) {

    try {
        const operations = [];
        const urlGroupDetails: any = await ConfigurationHelper.getUrlGroup(req);
        const urlGroup: string = urlGroupDetails.urlGroup;
        const configuration: any = await ConfigurationHelper.getApiGatewayConfiguration();
        if (Utils.isEmpty(urlGroup) || Utils.isEmpty(configuration.groupMiddlewareMapping[urlGroup])) {
            return Promise.resolve();
        }
        for (const middlewareName of Object.keys(configuration.groupMiddlewareMapping[urlGroup])) {
            if (configuration.groupMiddlewareMapping[urlGroup][middlewareName].active) {
                const middleware: any = await MiddlewareIndexer.getGroupMiddleware(middlewareName);
                operations.push(middleware.execute.bind(null, req, res));
            }
        }

        Utils.executeInSeries(operations, "Middleware", next);

    } catch (ex) {
        return next(ex);
    }

}

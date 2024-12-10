import { NextFunction, Request, Response } from "express";
import { ThirdPartyService } from "../../core/services/common/ThirdPartyService";
import { ConfigurationHelper } from "../../helper/configurationHelper";
import { C as Constants } from "../../config/constants/constants";
import { AuthenticationHelper } from "../../helper/authenticationHelper";
import { QueueService } from "../../core/services/common/QueueService";

export class ActivityTrackingMiddleware {

    public static async execute(req: Request, res: Response, next: NextFunction, middlewareProperties: any) {
        console.log("************* ActivityTracking Middleware *************");
        try {
            const configuration: any = await ConfigurationHelper.getApiGatewayConfiguration();
            const urlGroupDetails: any = await ConfigurationHelper.getUrlGroup(req);
            const urlGroup: string = urlGroupDetails.urlGroup;
            const message: any = await ActivityTrackingMiddleware.prepareMessage(req, configuration, urlGroup);
            // const queueService = new QueueService();
            const queue: any = Constants.RABBITMQ.QUEUE.ACTIVITY_TRACKER_QUEUE;
            QueueService.producer(queue, message);
            return next();
        } catch (err) {
            return next(err);
        }
    }

    public static async prepareMessage(req: Request, configuration: any, urlGroup: any) {
        try {
            const authToken: string = AuthenticationHelper.getAuthToken(req, configuration.groupMiddlewareMapping[urlGroup].ActivityTracking);
            let cachedToken: any = null;
            if (authToken) {
                cachedToken = await AuthenticationHelper.getCachedTokenData(authToken, true);
            }
            if (cachedToken) {
                req.headers.Authorization = ("Bearer " + AuthenticationHelper.resolveJwtToken(authToken, cachedToken));
            }
            const message: any = {
                url : req.protocol + "://" + req.get("host") + req.originalUrl,
                method : req.method,
                headers : req.headers,
                query : req.query ? req.query : "",
                body : req.body ? req.body : null,
                timestamp : new Date(),
            };
            return Promise.resolve(message);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    constructor() {
    }
}

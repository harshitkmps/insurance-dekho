import { Request, Response, Router } from "express";
import { ThirdPartyService } from "../common/ThirdPartyService";
import { Utils } from "../../../lib/Utils";
import { C } from "../../../config/constants/constants";
import { RedisClient } from "../../../config/database/redisClient";
import { ConfigurationHelper } from "../../../helper/configurationHelper";
export let apiGatewayConfiguration: any = null;

export class ConfigurationService {
    public redisClient = new RedisClient();

    constructor() {

    }

    public async getConfiguration(req: any, res: Response) {
        try {
            const configuration: any = await ConfigurationHelper.getApiGatewayConfiguration();
            return Promise.resolve({statusCode : 200, body : configuration});

        } catch (err) {
            return Promise.reject(err);
        }
    }

    public async setConfiguration(req: any, res: Response) {
        try {
            const data = {
                middlewares: req.body.middlewares || {},
                absoluteRoutes: req.body.absoluteRoutes || {},
                urlGroups: req.body.urlGroups || {},
                groupMiddlewareMapping: req.body.groupMiddlewareMapping || {},
                preDefaultMiddlewares: req.body.preDefaultMiddlewares || {},
                postDefaultMiddlewares: req.body.postDefaultMiddlewares || {},
                updatedAt: new Date(),
            };
            apiGatewayConfiguration = await ConfigurationHelper.updateApiGatewayConfiguration(data);
            return Promise.resolve({statusCode : 200, body : {message: "Configuration has been updated successfully" }});
        } catch (err) {
            return Promise.reject(err);
        }
    }
}

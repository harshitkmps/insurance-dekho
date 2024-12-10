import { NextFunction, request, Request, Response } from "express";
import { RedisClient } from "../../config/database/redisClient";
import crypto from "crypto";
import { ConfigurationHelper } from "../../helper/configurationHelper";
import { AuthenticationHelper } from "../../helper/authenticationHelper";

import _ from "lodash";
import { ThirdPartyService } from "../../core/services/common/ThirdPartyService";

export class LogoutMiddleware {

    public static async execute(req: Request, res: Response, next: NextFunction, middlewareProperties: any) {
        console.log("************* Logout MiddleWare *************");

        try {
            const configuration: any = await ConfigurationHelper.getApiGatewayConfiguration();
            const urlGroupDetails: any = await ConfigurationHelper.getUrlGroup(req);
            const urlGroup: string = urlGroupDetails.urlGroup;
            const authTokenKey: string = AuthenticationHelper.getAuthTokenKey(req, configuration.groupMiddlewareMapping[urlGroup].Logout);
            const authToken: string = AuthenticationHelper.getAuthToken(req, configuration.groupMiddlewareMapping[urlGroup].Logout);
            if (!authToken) {
                return next({err : "No auth token found"});
            }
            const cachedToken: any = await AuthenticationHelper.getCachedTokenData(authToken);

            if (!cachedToken) {
                return next({err : "Cached Token Error"});
            }

            if (!AuthenticationHelper.checkTokenExpiry(authToken, cachedToken)) {
                return next({ err: "Token has Expired" });
            }

            await new LogoutMiddleware().redisClient.deleteRedisKey(crypto.createHash("md5").update(authToken).digest("hex"));

            if (configuration.groupMiddlewareMapping[urlGroup].Logout.token && configuration.groupMiddlewareMapping[urlGroup].Logout.token.type === "cookie") {
                const options = configuration.groupMiddlewareMapping[urlGroup].Logout.token.properties;
                const cookieKey: any = AuthenticationHelper.getCookieKeyByHost(req, configuration.groupMiddlewareMapping[urlGroup].Logout.token);
                AuthenticationHelper.clearCookie(res, cookieKey, options);
            }

            if (cachedToken && cachedToken.hasOwnProperty("sessionId")) {
                res.setHeader("x-session-id", cachedToken.sessionId);
            }

            req.headers[authTokenKey] =  AuthenticationHelper.resolveJwtToken(authToken, cachedToken);
            req.headers["x-auth-token"] = req.headers[authTokenKey];
            if (configuration.groupMiddlewareMapping[urlGroup].Logout.sessionManager && configuration.groupMiddlewareMapping[urlGroup].Logout.sessionManager.active && cachedToken.sessionId) {
                const tps = new ThirdPartyService();
                const sessionManagerResponse: any = await tps.getRequest(req, res, configuration.groupMiddlewareMapping[urlGroup].Logout.sessionManager.url, {configuration, urlGroup, urlGroupDetails, sessionId : cachedToken.sessionId});
                if (sessionManagerResponse && sessionManagerResponse.body && sessionManagerResponse.body.data) {
                    res.setHeader("x-redirect-to", sessionManagerResponse.body.data);
                }
            }
            return next();
        } catch (err) {
            return next(err);
        }
    }

    private redisClient = new RedisClient();

    constructor() {
    }
}

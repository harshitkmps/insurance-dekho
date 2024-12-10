import { NextFunction, request, Request, Response } from "express";
import { ConfigurationHelper } from "../../helper/configurationHelper";
import { AuthenticationHelper } from "../../helper/authenticationHelper";

import _ from "lodash";
import crypto from "crypto";
export class AuthenticationMiddleware {

    public static async execute(req: Request, res: Response, next: NextFunction, middlewareProperties: any) {
        console.log("************* Authentication MiddleWare *************");

        try {
            const configuration: any = await ConfigurationHelper.getApiGatewayConfiguration();
            const urlGroupDetails: any = await ConfigurationHelper.getUrlGroup(req);
            const urlGroup: string = urlGroupDetails.urlGroup;
            const reqUrl: string = (req.originalUrl).replace(("/" + (urlGroupDetails.absoluteRouteGroup ? urlGroupDetails.absoluteRouteGroup : urlGroupDetails.urlGroup)), "");
            const authType: string = AuthenticationHelper.getAuthType(configuration.groupMiddlewareMapping[urlGroup].Authentication.authType, reqUrl);
            const authMode: string = configuration.groupMiddlewareMapping[urlGroup].Authentication.authMode === "hybrid" ? "hybrid" : "complete";
            switch (authType) {
                case "skip" :   {
                    break;
                }
                case "both" :   {
                    break;
                }
                case "strict" : {
                    const authTokenKey: string = AuthenticationHelper.getAuthTokenKey(req, configuration.groupMiddlewareMapping[urlGroup].Authentication);
                    const authToken: string = AuthenticationHelper.getAuthToken(req, configuration.groupMiddlewareMapping[urlGroup].Authentication);
                    if (authMode === "hybrid" && !authToken) {
                        break;
                    }
                    if (!authToken) {
                        return next({err : "No auth token found"});
                    }

                    const cachedToken = await AuthenticationHelper.getCachedTokenData(authToken);

                    if (!cachedToken ) {
                        return next({ err: "Cached Token not Found" });
                    }

                    if (!AuthenticationHelper.checkTokenExpiry(authToken, cachedToken)) {
                        return next({ err: "Token has Expired" });
                    }

                    req.headers.Authorization = "Bearer " + AuthenticationHelper.resolveJwtToken(authToken, cachedToken);
                    req.headers["Session-Id"] = crypto.createHash("md5").update(authToken).digest("hex");

                    break;
                }
                default : {
                    break;
                }
            }
            return next();
        } catch (err) {
            return next(err);
        }
    }

    constructor() {
    }
}

import { NextFunction, request, Request, Response } from "express";
import { ThirdPartyService } from "../../core/services/common/ThirdPartyService";
import { ConfigurationHelper } from "../../helper/configurationHelper";
import { AuthenticationHelper } from "../../helper/authenticationHelper";
import jwt = require("jsonwebtoken");
import _ from "lodash";
import moment = require("moment-timezone");
import { PartnerHelper } from "../../helper/partnerHelper";
import { C as Constants } from "../../config/constants/constants";

export class PartnerTokenGenerationMiddleware {

    public static async execute(req: Request, res: Response, next: NextFunction, middlewareProperties: any) {
        console.log("************* PartnerTokenGeneration Middleware *************");

        try {
            const configuration: any = await ConfigurationHelper.getApiGatewayConfiguration();
            const urlGroupDetails: any = await ConfigurationHelper.getUrlGroup(req);
            const urlGroup: string = urlGroupDetails.urlGroup;
            const tps = new ThirdPartyService();
            let apiResponse: any = null;
            let newUrl: any = null;
            let authToken: any = AuthenticationHelper.getAuthToken(req, configuration.groupMiddlewareMapping[urlGroup].PartnerTokenGeneration);
            if (authToken) {
                const cachedToken = await AuthenticationHelper.getCachedTokenData(authToken);
                if (!cachedToken ) {
                    return next({ err: "Cached Token not Found" });
                }

                if (!AuthenticationHelper.checkTokenExpiry(authToken, cachedToken)) {
                    return next({ err: "Token has Expired" });
                }
                apiResponse = {body : {data : {token : AuthenticationHelper.resolveJwtToken(authToken, cachedToken)}}};
            } else {
                if (req.headers["x-session-id"]) {
                    authToken = req.headers["x-session-id"];
                    const cachedToken = await AuthenticationHelper.getCachedTokenData(authToken);
                    if (!cachedToken) {
                        newUrl = `${configuration[(urlGroupDetails.type === "urlGroup" ? "urlGroups" : "absoluteRoutes")][urlGroup].outgoing}`;
                        apiResponse = await tps.commonRequest(req, res, newUrl, {configuration, urlGroup, urlGroupDetails});
                    } else {
                        if (!AuthenticationHelper.checkTokenExpiry(authToken, cachedToken)) {
                            return next({ err: "Token has Expired" });
                        }
                        apiResponse = {body : {data : {token : AuthenticationHelper.resolveJwtToken(authToken, cachedToken)}}};
                    }
                } else {
                    newUrl = `${configuration[(urlGroupDetails.type === "urlGroup" ? "urlGroups" : "absoluteRoutes")][urlGroup].outgoing}`;
                    apiResponse = await tps.commonRequest(req, res, newUrl, {configuration, urlGroup, urlGroupDetails});
                }
            }
            if (!apiResponse || !apiResponse.body || !apiResponse.body.data || !apiResponse.body.data.token) {
                return next({err : apiResponse});
            }
            const tokens = await PartnerHelper.saveJWTAndGenerateOneTimeToken(apiResponse.body.data.token);
            apiResponse.body = null;
            res.__responseData = apiResponse;
            res.setHeader(Constants.oneTimeTokenResponseHeader, tokens.oneTimeToken);
            res.setHeader(Constants.sessionIdHeader, tokens.sessionId);
            if (configuration.groupMiddlewareMapping[urlGroup].PartnerTokenGeneration.sessionManager && configuration.groupMiddlewareMapping[urlGroup].PartnerTokenGeneration.sessionManager.active) {
                const sessionManagerResponse: any = await tps.postRequest(req, res, configuration.groupMiddlewareMapping[urlGroup].PartnerTokenGeneration.sessionManager.url, false, {configuration, urlGroup, urlGroupDetails, sessionId : tokens.sessionId});
            }
            if (configuration.groupMiddlewareMapping[urlGroup].PartnerTokenGeneration.redirectionUrl) {
                res.redirect(configuration.groupMiddlewareMapping[urlGroup].PartnerTokenGeneration.redirectionUrl);
            }
            return next();
        } catch (err) {
            return next(err);
        }
    }

    constructor() {
    }
}

import { NextFunction, request, Request, Response } from "express";
import { ThirdPartyService } from "../../core/services/common/ThirdPartyService";
import { ConfigurationHelper } from "../../helper/configurationHelper";
import { AuthenticationHelper } from "../../helper/authenticationHelper";
import jwt = require("jsonwebtoken");
import _ from "lodash";
import moment = require("moment-timezone");
import { PartnerHelper } from "../../helper/partnerHelper";
import { C as Constants } from "../../config/constants/constants";

export class PartnerTokenValidationMiddleware {

    public static async execute(req: Request, res: Response, next: NextFunction, middlewareProperties: any) {
        console.log("************* PartnerTokenValidation Middleware *************");

        try {
            const configuration: any = await ConfigurationHelper.getApiGatewayConfiguration();
            const urlGroupDetails: any = await ConfigurationHelper.getUrlGroup(req);
            const urlGroup: string = urlGroupDetails.urlGroup;

            const oneTimeToken: any = req.query["one-time-token"];

            if (!oneTimeToken) {
                return next({code : "MIDOTT001", err : "one-time-token has not been provided"});
            }

            const tokens: any = await PartnerHelper.getCachedOneTimeTokenData(oneTimeToken);

            if (!tokens || !tokens.jwtToken) {
                return next({code : "MIDOTT002", err: "one-time-token not found. If this token has expired, please generate it again." });
            }

            req.headers.Authorization = "Bearer " + tokens.jwtToken;

            const tps = new ThirdPartyService();
            const queryParams: any = req.url.charAt(0) === "/" ? req.url.substring(1) : req.url;
            const newUrl: string = `${configuration[(urlGroupDetails.type === "urlGroup" ? "urlGroups" : "absoluteRoutes")][urlGroup].outgoing}${queryParams}`;

            if (configuration.groupMiddlewareMapping[urlGroup].PartnerTokenValidation.token && configuration.groupMiddlewareMapping[urlGroup].PartnerTokenValidation.token.generateOneTimeToken) {
                const ottResponseTokens = await PartnerHelper.saveJWTAndGenerateOneTimeToken(tokens.jwtToken);
                req.headers[Constants.oneTimeTokenResponseHeader] = ottResponseTokens.oneTimeToken;
            }

            const apiResponse: any = await tps.commonRequest(req, res, newUrl, {configuration, urlGroup, urlGroupDetails});

            if (!apiResponse) {
                return next({code : "MIDOTT003", err : apiResponse});
            }

            const decodedToken: any = jwt.decode(tokens.jwtToken);
            res.__responseData = apiResponse;
            const cookieValue: any = await PartnerHelper.setHashedSignature(tokens.jwtToken, tokens.sessionId);

            if (configuration.groupMiddlewareMapping[urlGroup].PartnerTokenValidation.token && configuration.groupMiddlewareMapping[urlGroup].PartnerTokenValidation.token.type === "cookie") {
                const expires: any = new Date(Math.floor((new Date(decodedToken.exp).getTime() * (1000))));
                configuration.groupMiddlewareMapping[urlGroup].PartnerTokenValidation.token.properties.expires = moment(expires).toDate();
                const options = configuration.groupMiddlewareMapping[urlGroup].PartnerTokenValidation.token.properties;
                const cookieKey: any = PartnerHelper.getCookieKeyByHost(req, configuration.groupMiddlewareMapping[urlGroup].PartnerTokenValidation.token);
                PartnerHelper.setCookie(res, cookieKey, cookieValue, options);
                if (decodedToken && decodedToken.data && decodedToken.data.referenceAuthId) {
                    PartnerHelper.setCookie(res, Constants.refAuthId, decodedToken.data.referenceAuthId, options);
                }
            }
            await PartnerHelper.deleteOneTimeToken(oneTimeToken);
            if (configuration.groupMiddlewareMapping[urlGroup].PartnerTokenValidation.redirectionUrl) {
                res.redirect(configuration.groupMiddlewareMapping[urlGroup].PartnerTokenValidation.redirectionUrl);
            }
            if (configuration.groupMiddlewareMapping[urlGroup].PartnerTokenValidation.token && configuration.groupMiddlewareMapping[urlGroup].PartnerTokenValidation.token.generateOneTimeToken) {
                const ottResponseTokens = await PartnerHelper.saveJWTAndGenerateOneTimeToken(tokens.jwtToken);
                res.setHeader(Constants.oneTimeTokenResponseHeader, ottResponseTokens.oneTimeToken);
            }
            return next();
        } catch (err) {
            return next(err);
        }
    }

    constructor() {
    }
}

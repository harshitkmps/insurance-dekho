import { NextFunction, request, Request, Response } from "express";
import { ThirdPartyService } from "../../core/services/common/ThirdPartyService";
import { ConfigurationHelper } from "../../helper/configurationHelper";
import { AuthenticationHelper } from "../../helper/authenticationHelper";
import jwt = require("jsonwebtoken");

import _ from "lodash";
import { DateImported } from "aws-sdk/clients/transfer";
import moment = require("moment-timezone");
import { PartnerHelper } from "../../helper/partnerHelper";
import { C as Constants } from "../../config/constants/constants";
export class LoginMiddleware {

    public static async execute(req: Request, res: Response, next: NextFunction, middlewareProperties: any) {
        console.log("************* Login MiddleWare *************");

        try {
            const configuration: any = await ConfigurationHelper.getApiGatewayConfiguration();
            const urlGroupDetails: any = await ConfigurationHelper.getUrlGroup(req);
            const urlGroup: string = urlGroupDetails.urlGroup;
            const tps = new ThirdPartyService();
            const newUrl: string = `${configuration[(urlGroupDetails.type === "urlGroup" ? "urlGroups" : "absoluteRoutes")][urlGroup].outgoing}`;
            const apiResponse: any = await tps.commonRequest(req, res, newUrl, {configuration, urlGroup, urlGroupDetails});
            if (!apiResponse || !apiResponse.body || !apiResponse.body.data || !apiResponse.body.data.token) {
                return next({err : apiResponse});
            }
            const jwtToken: any = apiResponse.body.data.token;
            const decodedToken: any = jwt.decode(apiResponse.body.data.token);
            apiResponse.body.data.token = await AuthenticationHelper.setHashedSignature(apiResponse.body.data.token);
            res.__responseData = apiResponse;
            if (configuration.groupMiddlewareMapping[urlGroup].Login.token && configuration.groupMiddlewareMapping[urlGroup].Login.token.type === "cookie") {
                const expires: any = new Date(Math.floor((new Date(decodedToken.exp).getTime() * (1000))));
                configuration.groupMiddlewareMapping[urlGroup].Login.token.properties.expires = moment(expires).toDate();
                const options = configuration.groupMiddlewareMapping[urlGroup].Login.token.properties;
                const domain: any = AuthenticationHelper.getCookieDomain(req, configuration.groupMiddlewareMapping[urlGroup].Login.token);
                options.domain = domain;
                const cookieKey: any = AuthenticationHelper.getCookieKeyByHost(req, configuration.groupMiddlewareMapping[urlGroup].Login.token);
                AuthenticationHelper.setCookie(res, cookieKey, apiResponse.body.data.token, options);
                if (configuration.groupMiddlewareMapping[urlGroup].Login.token && configuration.groupMiddlewareMapping[urlGroup].Login.token.generateOneTimeToken) {
                    const tokens = await PartnerHelper.saveJWTAndGenerateOneTimeToken(jwtToken);
                    apiResponse.body.data.oneTimeToken = tokens.oneTimeToken;
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

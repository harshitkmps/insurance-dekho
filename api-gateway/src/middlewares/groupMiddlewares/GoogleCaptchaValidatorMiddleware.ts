import { NextFunction, request, Request, Response } from "express";
import { ConfigurationHelper } from "../../helper/configurationHelper";
import { AuthenticationHelper } from "../../helper/authenticationHelper";
import _ from "lodash";

export class GoogleCaptchaValidatorMiddleware {

    public static async execute(req: Request, res: Response, next: NextFunction, middlewareProperties: any) {
        console.log("************* Google Captcha Validator MiddleWare *************");

        try {
            const configuration: any = await ConfigurationHelper.getApiGatewayConfiguration();
            const urlGroupDetails: any = await ConfigurationHelper.getUrlGroup(req);
            const urlGroup: string = urlGroupDetails.urlGroup;
            const captchaTokenKey: string = configuration.groupMiddlewareMapping[urlGroup].GoogleCaptchaValidator.key;
            if (captchaTokenKey && req.headers && req.headers[captchaTokenKey]) {
                const captchaToken: any = req.headers[captchaTokenKey];
                await AuthenticationHelper.checkGoogleRecaptcha(req, res, captchaToken);
                return next();
            } else {
                return next("No Captcha Token Provided");
            }
        } catch (err) {
            console.log("err", err);
            return next(err);
        }
    }

    constructor() {
    }
}

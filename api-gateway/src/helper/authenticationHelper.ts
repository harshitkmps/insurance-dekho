import { RedisClient } from "../config/database/redisClient";
import { Request, Response } from "express";
import jwt = require("jsonwebtoken");
import crypto from "crypto";
import _ from "lodash";
import { C as Constants } from "../config/constants/constants";
import { Utils } from "../lib/Utils";
import { AnyLengthString } from "aws-sdk/clients/comprehendmedical";
export class AuthenticationHelper {

    public static getAuthType(authType: any, reqUrl: string) {
        let level: string = "strict";
        if (authType.skip && _.find(authType.skip, (url: string) => url === reqUrl)) {
            level = "skip";
        }
        // if (authType.both && _.find(authType.both, (url: string) => url === reqUrl)) {
        //     level = "both";
        // }
        return level;
    }

    public static getAuthTokenKey(req: Request, middleware: any) {
        let key: string = "x-auth-token";
        const authToken: string = "";
        if (middleware.token && middleware.token.key) {
            key = this.getCookieKeyByHost(req, middleware.token);
        }
        return key;
    }

    public static getAuthToken(req: Request, middleware: any) {
        let authToken: string = "";
        const key: string = this.getAuthTokenKey(req, middleware);
        if (middleware && middleware.token) {
            if (middleware.token.type === "cookie") {
                authToken = req.cookies[key] as string;
            } else {
                if (req.headers && req.headers[key.toLocaleLowerCase()]) {
                    if (key.toLocaleLowerCase() === "authorization") {
                        authToken = req.headers[key.toLocaleLowerCase()] as string;
                        authToken = authToken.replace("Bearer ", "");
                    } else {
                        authToken = req.headers[key] as string;
                    }
                }
            }
        }
        return authToken;
    }

    public static async setHashedSignature(token: string) {

        const tokenElements = token.split(".");
        const hashedSignature = crypto.createHash("md5").update(tokenElements[2]).digest("hex");
        const decodedToken: any = jwt.decode(token);
        const ttl: number = +new Date(Math.floor((new Date(decodedToken.exp).getTime() / (1000)))) - (+new Date());
        await this.redisClient.setRedisData(hashedSignature, { header: tokenElements[0], payload: tokenElements[1] }, ttl);
        return tokenElements[2];
    }

    public static async getCachedTokenData(accessToken: string, bypass ?: boolean) {
        const cachedTokenData = await this.redisClient.getRedisData(crypto.createHash("md5").update(accessToken).digest("hex"));

        if (!cachedTokenData && !bypass) {
            return Promise.reject("Invalid Access Token");
        }
        return Promise.resolve(cachedTokenData);
    }
    public static checkTokenExpiry(accessToken: string, cachedTokenData: any) {
        const jwtToken: string = this.resolveJwtToken(accessToken, cachedTokenData);
        const decodedToken: any = jwt.decode(jwtToken);
        if ((+new Date(Math.floor((new Date(decodedToken.exp).getTime() * 1000))) + this.tokenOffset) > +new Date()) {
            return true;
        } else {
            return false;
        }
    }
    public static resolveJwtToken(accessToken: string, cachedTokenData: any) {
        return cachedTokenData.header + "." + cachedTokenData.payload + "." + accessToken;
    }

    public static setCookie(res: any, tokenKey: string, tokenValue: string, options: any) {
        res.cookie(tokenKey, tokenValue, options);
    }

    public static clearCookie(res: any, tokenKey: string, options: any) {
        if (!Utils.isEmpty(options)) {
            res.clearCookie(tokenKey, options);
        } else {
            res.clearCookie(tokenKey);
        }
    }

    public static async checkGoogleRecaptcha(req: Request, res: Response, captchaToken: string) {
        const Recaptcha = require("recaptcha-verify");
        return new Promise(async (resolve, reject) => {
            try {
                const recaptcha = new Recaptcha({
                    secret: Constants.RECAPTCHA_SECRET,
                    verbose: true,
                });
                if (captchaToken && !Utils.isEmpty(captchaToken)) {
                    console.log("recaptcha", recaptcha);
                    console.log("captchaToken", captchaToken);
                    recaptcha.checkResponse(captchaToken, (error: any, response: any) => {
                        if (error) {reject(error); }
                        if (response && response.success) {
                            resolve(true);
                        } else {
                            reject("Invalid Google Recaptcha");
                        }
                    });
                } else {
                    reject("No Captcha Token Provided");
                }
            } catch (err) {
                console.log("captcha err");
                reject(err);
            }
        });
    }

    public static getCookieDomain(req: Request, middleware: any) {
        let hostname: any = middleware.properties.domain;
        if (middleware.allowedDomains && middleware.allowedDomains.length > 0) {
            const hostArray: any = req.header("host")?.split(".");
            const host: string = hostArray[hostArray.length - 2] + "." + hostArray[hostArray.length - 1];
            const allowedHost: any = _.find(middleware.allowedDomains, (domain: any) => domain === host);
            if (allowedHost) {
                hostname = "." + host;
            }
        }
        return hostname;
    }

    public static getCookieKeyByHost(req: Request, middleware: any) {
        let key: any = middleware.key;
        const host: any = req.get("host");
        if (middleware.hostCookie && middleware.hostCookie.hasOwnProperty(host)) {
            key = middleware.hostCookie[host];
        }
        return key;
    }

    private static tokenOffset: number = 10000;

    private static redisClient = new RedisClient();

    constructor() {

    }
}

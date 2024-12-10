import { RedisClient } from "../config/database/redisClient";
import { Request, Response } from "express";
import jwt = require("jsonwebtoken");
import crypto from "crypto";
import _ from "lodash";
import { C as Constants } from "../config/constants/constants";
import { Utils } from "../lib/Utils";
import { AnyLengthString } from "aws-sdk/clients/comprehendmedical";
import { v4 as uuidv4 } from "uuid";

export class PartnerHelper {

    public static async saveJWTAndGenerateOneTimeToken(jwtToken: string) {
        const tokenElements = jwtToken.split(".");
        const oneTimeToken = crypto.createHash("md5").update(uuidv4()).digest("hex");
        const sessionId = crypto.createHash("md5").update(tokenElements[2]).digest("hex");
        await this.redisClient.setRedisData(oneTimeToken, { jwtToken, sessionId }, (Constants.oneTimeTokenExpiry * 60 * 1000));
        return {oneTimeToken, sessionId};
    }

    public static async getCachedOneTimeTokenData(oneTimeToken: string) {
        const oneTimeTokenData: any = await this.redisClient.getRedisData(oneTimeToken);
        const jwtToken: any = (oneTimeTokenData ? oneTimeTokenData.jwtToken : null);
        const sessionId: any = (oneTimeTokenData ? oneTimeTokenData.sessionId : null);
        return Promise.resolve({jwtToken, sessionId});
    }

    public static async setHashedSignature(token: string, sessionId: string) {
        const tokenElements = token.split(".");
        const hashedSignature = crypto.createHash("md5").update(tokenElements[2]).digest("hex");
        const decodedToken: any = jwt.decode(token);
        const ttl: number = +new Date(Math.floor((new Date(decodedToken.exp).getTime() / (1000)))) - (+new Date());
        await this.redisClient.setRedisData(hashedSignature, { header: tokenElements[0], payload: tokenElements[1], sessionId }, ttl);
        return tokenElements[2];
    }

    public static getCookieKeyByHost(req: Request, middleware: any) {
        let key: any = middleware.key;
        const host: any = req.get("host");
        if (middleware.hostCookie && middleware.hostCookie.hasOwnProperty(host)) {
            key = middleware.hostCookie[host];
        }
        return key;
    }

    public static setCookie(res: any, tokenKey: string, tokenValue: string, options: any) {
        res.cookie(tokenKey, tokenValue, options);
    }

    public static async deleteOneTimeToken(oneTimeToken: string) {

        await this.redisClient.setRedisData(oneTimeToken, { jwtToken: null }, (1 * 60 * 1000));
        return Promise.resolve();
    }

    private static redisClient = new RedisClient();

    constructor() {

    }
}

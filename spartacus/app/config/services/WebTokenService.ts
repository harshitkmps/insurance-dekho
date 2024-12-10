/**
 * Author   -   Ankit Shukla
 */

import { EncryptJWT, jwtDecrypt, base64url } from "jose";
import logger from "@config/services/WinstonConfig";

export default class WebTokenService {

    static generateSecureToken = async (tokenData: any) => {

        // setup config
        const secret = base64url.decode(process.env.SECURE_TOKEN_SECRET || '0f52ee9dfgf7d25de7c2ed8527159e06ed2dcbe4');

        // generate json web token
        const jwt = new EncryptJWT(tokenData)
            .setProtectedHeader({ alg: process.env.SECURE_TOKEN_ALG || 'dir', enc: process.env.SECURE_TOKEN_ENC || 'A128CBC-HS256' })
            .setIssuedAt()
            .encrypt(secret);

        return { token: jwt };
    };

    static getDataFromSecureToken = async (token: string) => {

        // setup config
        const secret = base64url.decode(process.env.SECURE_TOKEN_SECRET || '0f52ee9dfgf7d25de7c2ed8527159e06ed2dcbe4');
        const jwt = token;

        // decrypt and validate token
        try {
            const { payload } = await jwtDecrypt(jwt, secret)

            if (!payload) return { error_msg: 'Authentication Failed !!' };

            return payload;

        } catch (err) {
            logger.error(err);
            throw "Authentication Engine Failed !!";
        }
    };
}
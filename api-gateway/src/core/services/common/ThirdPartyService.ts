import { Utils } from "../../../lib/Utils";
import { ResponseFormatter } from "../../../lib/ResponseFormatter";
import moment = require("moment-timezone");
moment.tz.setDefault("Asia/Calcutta");

import request from "request";
import {Request, Response} from "express";
import { ConfigurationHelper } from "../../../helper/configurationHelper";
import axios from "axios";

interface ITpRequestData {
    apiName: string;
    requestUrl: string;
    requestMethod: string;
    requestHeaders?: object;
    request?: object;
    response?: any;
    source?: string;
    subSource?: string;
    requestTime?: string;
}

export class ThirdPartyService {

    public tpApiServiceTimeout = 50000;

    // tslint:disable-next-line: no-empty
    constructor() {

    }

    public async commonRequest(req: Request, res: Response, requestUrl: string, options: any) {
        if (req.method === "GET") {
            const result: any = await this.getRequest(req, res, requestUrl, options);
            res.__body = result;
            return Promise.resolve(result);
        } else if (req.method === "POST") {
            // console.log('req.method---->', req.method, req.get('Content-Type'),req);
            const sendForm = req.get("Content-Type") ? req.get("Content-Type")?.includes("application/json") ? false : true : false;
            const result: any = await this.postRequest(req, res, requestUrl, sendForm, options);
            res.__body = result;
            return Promise.resolve(result);
        } else if (req.method === "PUT") {
            const sendForm = req.get("Content-Type") ? req.get("Content-Type")?.includes("application/json") ? false : true : false;
            const result: any = await this.putRequest(req, res, requestUrl, sendForm, options);
            res.__body = result;
            return Promise.resolve(result);
        } else if (req.method === "PATCH") {
            const sendForm = req.get("Content-Type") ? req.get("Content-Type")?.includes("application/json") ? false : true : false;
            const result: any = await this.patchRequest(req, res, requestUrl, sendForm, options);
            res.__body = result;
            return Promise.resolve(result);
        } else {
            // console.log('req.method---->', req.method, req.get('Content-Type'),req);
            const sendForm = req.get("Content-Type") ? req.get("Content-Type")?.includes("application/json") ? false : true : false;
            const result: any = await this.postRequest(req, res, requestUrl, sendForm, options);
            res.__body = result;
            return Promise.resolve(result);
        }
    }
    /** Call this function to make post request and log req-resp in mongo log (fw/tw/cv : _third_party_api_log)
     * @param postUrl String
     * @param postData Object : data to post
     * @param request Object
     * @param  logData Object : data to log in db
     *  To create n update { isCreateLog : 1, data : { } }
     *  To update only : { isUpdateLog : 1, {updateOn : keyName on which we have to update postResponse data }, condition : {} }
     */

    public async postRequest(req: Request, res: Response, requestUrl: string, sendForm: boolean = false, options: any) {
        try {
            return new Promise((resolve, reject) => {
                const headers: any = Utils.isEmpty(req.headers) ? { "content-type": "application/json" } : req.headers;
                let _headers: any = {
                    "Content-Type" : headers["content-type"],
                    "x-auth-id" : headers["x-auth-id"],
                    "x-auth-token" : headers["x-auth-token"],
                    "Authorization" : headers.Authorization,
                    "Cookie" : headers.Cookie ? headers.Cookie : headers.cookie,
                    "Session-Id" : headers["Session-Id"] ? headers["Session-Id"] : options.sessionId,
                    "referer" : headers.referer,
                };
                if (headers["One-Time-Token"]) {
                    _headers["One-Time-Token"] = headers["One-Time-Token"];
                }
                _headers = ConfigurationHelper.appendHeaders(req, _headers, options);
                try {
                    const option: any = {
                        headers : _headers,
                        url: requestUrl,
                        json: true,
                        timeout: this.tpApiServiceTimeout,
                    };
                    if (sendForm) {
                        option.form = req.body;
                    } else { option.body = req.body; }
                    request.post(option, async (error: any, response: any, body: any) => {

                        if (error) {
                            body = error;
                        }
                        body = (typeof body !== "object" ? "" : body);
                        this.setResponseHeaders(req, res, response);
                        return resolve({statusCode : response.statusCode || 200, body, thirdPartyResponse : response});
                    });
                } catch (err) {

                    if (!Utils.isEmpty(err.code) && err.code === "ETIMEDOUT") {
                        const error = ResponseFormatter.getErrorResponseWithBody(500, "TPS002", "ETIMEDOUT", {body : err});
                        return resolve({ error });
                    } else {
                        const error = ResponseFormatter.getErrorResponseWithBody(500, "TPS003", "Code Error in TPS POST Request", {body : err});
                        return resolve({ error });
                    }
                }
            });

        } catch (err) {
            const error = ResponseFormatter.getErrorResponseWithBody(500, "TPS004", "Error While Posting", err);
            return Promise.resolve({ error });
        }
    }

    public async putRequest(req: Request, res: Response, requestUrl: string, sendForm: boolean = false, options: any) {
        try {
            return new Promise((resolve, reject) => {
                const headers: any = Utils.isEmpty(req.headers) ? { "content-type": "application/json" } : req.headers;
                let _headers: any = {
                    "Content-Type" : headers["content-type"],
                    "x-auth-id" : headers["x-auth-id"],
                    "x-auth-token" : headers["x-auth-token"],
                    "Authorization" : headers.Authorization,
                    "Cookie" : headers.Cookie ? headers.Cookie : headers.cookie,
                    "Session-Id" : headers["Session-Id"] ? headers["Session-Id"] : options.sessionId,
                    "referer" : headers.referer,
                };
                if (headers["One-Time-Token"]) {
                    _headers["One-Time-Token"] = headers["One-Time-Token"];
                }
                _headers = ConfigurationHelper.appendHeaders(req, _headers, options);
                try {
                    const option: any = {
                        headers : _headers,
                        url: requestUrl,
                        json: true,
                        timeout: this.tpApiServiceTimeout,
                    };
                    if (sendForm) {
                        option.form = req.body;
                    } else { option.body = req.body; }
                    request.put(option, async (error: any, response: any, body: any) => {

                        if (error) {
                            body = error;
                        }
                        body = (typeof body !== "object" ? "" : body);
                        this.setResponseHeaders(req, res, response);
                        return resolve({statusCode : response.statusCode || 200, body, thirdPartyResponse : response});
                    });
                } catch (err) {

                    if (!Utils.isEmpty(err.code) && err.code === "ETIMEDOUT") {
                        const error = ResponseFormatter.getErrorResponseWithBody(500, "TPS002", "ETIMEDOUT", {body : err});
                        return resolve({ error });
                    } else {
                        const error = ResponseFormatter.getErrorResponseWithBody(500, "TPS003", "Code Error in TPS POST Request", {body : err});
                        return resolve({ error });
                    }
                }
            });

        } catch (err) {
            const error = ResponseFormatter.getErrorResponseWithBody(500, "TPS004", "Error While Posting", err);
            return Promise.resolve({ error });
        }
    }

    public async getRequest(req: Request, res: Response, requestUrl: string, options: any) {
        try {
            const headers: any = Utils.isEmpty(req.headers) ? { "content-type": "application/json" } : req.headers;
            // let _headers: any = headers;
            let _headers: any = {};
            if (headers["Content-Type"]) {
                _headers["Content-Type"] = headers["Content-Type"];
            }
            if (headers.Authorization) {
                _headers.Authorization = headers.Authorization;
            }
            if (headers.Cookie) {
                _headers.Cookie = headers.Cookie ? headers.Cookie : headers.cookie;
            }
            if (headers["x-api-key"]) {
                _headers["x-api-key"] = headers["x-api-key"];
            }
            if (options.sessionId) {
                _headers["Session-Id"] = options.sessionId;
            }
            if (headers.referer) {
                _headers.referer = headers.referer;
            }
            if (headers["One-Time-Token"]) {
                _headers["One-Time-Token"] = headers["One-Time-Token"];
            }
            if (headers["Session-Id"]) {
                _headers["Session-Id"] = headers["Session-Id"] ? headers["Session-Id"] : options.sessionId;
            }
            _headers = ConfigurationHelper.appendHeaders(req, _headers, options);
            try {
                const response: any = await axios.get(
                    requestUrl,
                    {
                        headers : _headers,
                        maxRedirects : 0,
                        validateStatus(status) {
                            return (status >= 200 && status <= 302) ? true : false;
                        },
                    },
                );
                if (response && (response.status >= 200 || response.status <= 302)) {
                    this.setResponseHeaders(req, res, response);
                    return Promise.resolve({statusCode : response.status || 200, body : response.data, thirdPartyResponse : response});

                } else {
                    const error = ResponseFormatter.getErrorResponseWithBody(500, "TPS004", "Error While Executing Get Request", response);
                    return Promise.resolve({ error });
                }
            } catch (err) {
                const errorResponse: any = (err && err.response && err.response.data) ? err.response.data : err;
                const errorStatus: any = (err && err.response && err.response.status) ? err.response.status : err;
                return Promise.resolve({statusCode : errorStatus || 200, body : errorResponse, thirdPartyResponse : errorResponse});
            }

        } catch (err) {
            const error = ResponseFormatter.getErrorResponseWithBody(500, "TPS004", "Error While Executing Get Request", err);
            return Promise.resolve({ error });
        }
    }

    public setResponseHeaders(req: Request, res: Response, thirdPartyResponse: any) {
        if (thirdPartyResponse && thirdPartyResponse.headers) {
            if (thirdPartyResponse.headers["content-type"]) {
                res.setHeader("content-type", thirdPartyResponse.headers["content-type"]);
            }
            if (thirdPartyResponse.headers["set-cookie"]) {
                res.setHeader("set-cookie", thirdPartyResponse.headers["set-cookie"]);
            }
            if (thirdPartyResponse.headers.location) {
                res.setHeader("location", thirdPartyResponse.headers.location);
            }
            if (thirdPartyResponse.headers["correlation-id"]) {
                res.setHeader("correlation-id", thirdPartyResponse.headers["correlation-id"]);
            }
        }
    }

    public async patchRequest(req: Request, res: Response, requestUrl: string, sendForm: boolean = false, options: any) {
        try {
            return new Promise((resolve, reject) => {
                const headers: any = Utils.isEmpty(req.headers) ? { "content-type": "application/json" } : req.headers;
                let _headers: any = {
                    "Content-Type" : headers["content-type"],
                    "x-auth-id" : headers["x-auth-id"],
                    "x-auth-token" : headers["x-auth-token"],
                    "Authorization" : headers.Authorization,
                    "Cookie" : headers.Cookie ? headers.Cookie : headers.cookie,
                    "referer" : headers.referer,
                    "Session-Id" : headers["Session-Id"] ? headers["Session-Id"] : options.sessionId,
                };
                if (headers["One-Time-Token"]) {
                    _headers["One-Time-Token"] = headers["One-Time-Token"];
                }
                _headers = ConfigurationHelper.appendHeaders(req, _headers, options);
                try {
                    const option: any = {
                        headers : _headers,
                        url: requestUrl,
                        json: true,
                        timeout: this.tpApiServiceTimeout,
                    };
                    if (sendForm) {
                        option.form = req.body;
                    } else { option.body = req.body; }
                    request.patch(option, async (error: any, response: any, body: any) => {

                        if (error) {
                            body = error;
                        }
                        body = (typeof body !== "object" ? "" : body);
                        this.setResponseHeaders(req, res, response);
                        return resolve({statusCode : response.statusCode || 200, body, thirdPartyResponse : response});
                    });
                } catch (err) {

                    if (!Utils.isEmpty(err.code) && err.code === "ETIMEDOUT") {
                        const error = ResponseFormatter.getErrorResponseWithBody(500, "TPS002", "ETIMEDOUT", {body : err});
                        return resolve({ error });
                    } else {
                        const error = ResponseFormatter.getErrorResponseWithBody(500, "TPS003", "Code Error in TPS POST Request", {body : err});
                        return resolve({ error });
                    }
                }
            });

        } catch (err) {
            const error = ResponseFormatter.getErrorResponseWithBody(500, "TPS004", "Error While Posting", err);
            return Promise.resolve({ error });
        }
    }
}

import { apiGatewayConfiguration } from "../core/services/configuration/ConfigurationService";
import { RedisClient } from "../config/database/redisClient";
import { Utils } from "../lib/Utils";
import { C } from "../config/constants/constants";
import { Request } from "express";
import { config } from "../config/gateway.config";

let IapiGatewayConfiguration: any = null;
export class ConfigurationHelper {

    public static redisClient = new RedisClient();

    public static async getUrlGroup(req: Request) {
        try {
            const configuration: any = await this.getApiGatewayConfiguration();
            const baseUrl: string = req.protocol + "://" + req.get("host");
            const requestUrl: string = req.baseUrl;
            const urlComponents: string[] = (requestUrl).split("/");
            const urlGroup: string = urlComponents[C.urlGroupIndex];
            if (configuration.absoluteRoutes && configuration.absoluteRoutes[requestUrl]) {
                if (this.validateDomain(baseUrl, configuration.absoluteRoutes[requestUrl].allowedDomains)) {
                    return Promise.resolve({type : "absoluteRoute", urlGroup : requestUrl, absoluteRouteGroup : urlGroup});
                }
                return Promise.reject({err : "Invalid Domain"});
            } else {
                if (this.validateDomain(baseUrl, configuration.urlGroups[urlGroup].allowedDomains)) {
                    return Promise.resolve({type : "urlGroup", urlGroup});
                }
                return Promise.reject({err : "Invalid Domain"});
            }
        } catch (err) {
            return Promise.reject(err);
        }
    }

    public static async isMiddlewareActive(middlewareName: string) {
        const configuration: any = await this.getApiGatewayConfiguration();
        if (configuration.middlewares[middlewareName].active) {
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }

    public static async getApiGatewayConfiguration() {
        try {
            if (IapiGatewayConfiguration) {
                return Promise.resolve(IapiGatewayConfiguration);
            } else {
                const configuration: any = config;
                IapiGatewayConfiguration = this.formatApiGatewayConfiguration(configuration);
                return Promise.resolve(apiGatewayConfiguration);
            }
        } catch (err) {
            IapiGatewayConfiguration = null;
            return Promise.reject(err);
        }
    }

    public static async updateApiGatewayConfiguration(configuration: any) {
        try {
            IapiGatewayConfiguration = await this.formatApiGatewayConfiguration(configuration);
            return Promise.resolve(IapiGatewayConfiguration);
        } catch (err) {
            IapiGatewayConfiguration = null;
            return Promise.reject(err);
        }
    }

    public static appendHeaders(req: Request, headers: any, options: any) {
        try {
            headers[C.hostNameKey] = req.get("host");
            let _headers: any = {};
            if (options.urlGroupDetails.type === "absoluteRoute") {
                if (!Utils.isEmpty(options.configuration.absoluteRoutes[options.urlGroup].headers)) {
                    _headers = Object.assign({}, options.configuration.absoluteRoutes[options.urlGroup].headers);
                }
                if (req.headers["x-utm-source"]) {
                    const utm_source_key: any = req.headers["x-utm-source"];
                    if (options.configuration.absoluteRoutes[options.urlGroup]["x-utm-source"]) {
                        const tempApiKey  =  options.configuration.absoluteRoutes[options.urlGroup]["x-utm-source"][utm_source_key];
                        if (tempApiKey) {
                            _headers["x-api-key"] = tempApiKey;
                        }
                    }
                }
            } else {
                if (!Utils.isEmpty(options.configuration.urlGroups[options.urlGroup].headers)) {
                    _headers = Object.assign({}, options.configuration.urlGroups[options.urlGroup].headers);
                }
                if (req.headers["x-utm-source"]) {
                    const utm_source_key: any = req.headers["x-utm-source"];
                    if (options.configuration.urlGroups[options.urlGroup]["x-utm-source"]) {
                        const tempApiKey  =  options.configuration.urlGroups[options.urlGroup]["x-utm-source"][utm_source_key];
                        if (tempApiKey) {
                            _headers["x-api-key"] = tempApiKey;
                        }
                    }
                }
            }
            if (req.headers["x-api-key"]) {
                _headers["x-api-key"] = req.headers["x-api-key"];
            }
            headers = {...headers, ..._headers};
            return headers;
        } catch (err) {
            return err;
        }
    }

    public static async getApiResponseVersion(req: Request, groupType: string, urlGroup: string) {
        try {
            let version: string = C.apiResponseVersion.v1;
            const configuration: any = await this.getApiGatewayConfiguration();
            const group: any = groupType === "absoluteRoute" ? configuration.absoluteRoutes[urlGroup] : configuration.urlGroups[urlGroup];
            const host: any = req.get("host");
            if (host && group && group.apiVersion && group.apiVersion.hasOwnProperty(host)) {
                version = group.apiVersion[host];
            }
            return Promise.resolve(version);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    private static validateDomain(baseUrl: string, allowedDomains: any) {
        let isDomainValid: boolean = false;
        console.log("baseUrl", baseUrl);
        if (Utils.isEmpty(allowedDomains)) {
            isDomainValid = true;
        }
        for (const allowedDomain of allowedDomains) {
            if (baseUrl === allowedDomain) {
                isDomainValid = true;
                break;
            }
        }
        return isDomainValid;
    }

    private static formatApiGatewayConfiguration(configuration: any) {
        if (configuration) {
            for (const urlGroup in configuration.groupMiddlewareMapping) {
                if (configuration.groupMiddlewareMapping.hasOwnProperty(urlGroup)) {
                    const groupMiddlewareMapping: any = {};
                    this.processGroupMiddlewares(configuration, configuration.preDefaultMiddlewares, groupMiddlewareMapping);
                    this.processGroupMiddlewares(configuration, configuration.groupMiddlewareMapping[urlGroup], groupMiddlewareMapping);
                    this.processGroupMiddlewares(configuration, configuration.postDefaultMiddlewares, groupMiddlewareMapping);
                    configuration.groupMiddlewareMapping[urlGroup] = groupMiddlewareMapping;
                }
            }
        }
        return configuration;
    }

    private static processGroupMiddlewares(configuration: any, groupMiddlewares: any, groupMiddlewareMapping: any) {
        for (const middlewareName in groupMiddlewares) {
            if (groupMiddlewares.hasOwnProperty(middlewareName)) {
                const defaultMiddleware: any = configuration.middlewares[middlewareName];
                if (defaultMiddleware) {
                    const merged: any = { ...defaultMiddleware, ...groupMiddlewares[middlewareName] };
                    groupMiddlewareMapping[middlewareName] = merged;
                }
            }
        }
        return;
    }

    constructor() {

    }
}

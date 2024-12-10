import { ConfigurationHelper } from "../../../helper/configurationHelper";
import {Utils} from "../../../lib/Utils";
import {Request, Response} from "express";
import { ThirdPartyService } from "../common/ThirdPartyService";
import { C } from "../../../config/constants/constants";
export class RedirectionService {

    constructor() {

    }

    public async redirect(req: Request, res: Response) {
        try {
            let pathName: string;
            let newUrl: string;
            let version: string = C.apiResponseVersion.v1;
            const configuration: any = await  ConfigurationHelper.getApiGatewayConfiguration();

            const urlGroupDetails: any = await ConfigurationHelper.getUrlGroup(req);
            const urlGroup: string = urlGroupDetails.urlGroup;
            version = await ConfigurationHelper.getApiResponseVersion(req, urlGroupDetails.type, urlGroup);

            if (Utils.isEmpty(urlGroup)) {
                return Promise.resolve();
            }

            if (res && res.__responseData) {
                return Promise.resolve({apiResponse : res.__responseData, version});
            }
            if (urlGroupDetails.type === "absoluteRoute") {
                newUrl = `${configuration.absoluteRoutes[urlGroup].outgoing}${req.url}`;
            } else {
                pathName = (req.originalUrl).replace(`/${urlGroup}`, "");
                newUrl = `${configuration.urlGroups[urlGroup].outgoing}${pathName}`;
            }
            const tps = new ThirdPartyService();
            res.__path = newUrl;
            const apiResponse: any = await tps.commonRequest(req, res, newUrl, {configuration, urlGroup, urlGroupDetails});

            return Promise.resolve({apiResponse, version});

        } catch (err) {
            return Promise.reject(err);
        }
    }
}

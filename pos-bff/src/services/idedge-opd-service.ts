import { Injectable, Logger } from "@nestjs/common";

// import { UseCache } from "./helpers/cache-helper";
import CommonApiHelper from "./helpers/common-api-helper";

@Injectable()
export default class IDEdgeApiService {
  constructor(public apiHelper: CommonApiHelper) {}

  // @UseCache({ expiryTimer: 1800 })
  public async getOttForIdEdgeGateway(
    authtoken: string | null,
    mobile: string
  ): Promise<string> {
    const options = {
      endpoint: process.env.POS_URL + "/iam/api/v1/user/auth/partner",
      config: {
        headers: {
          "x-api-key": process.env.IAM_X_API_KEY,
          "x-hostname": process.env.IAM_API_HOST,
          "Content-Type": "application/json",
          "x-session-id": authtoken,
        },
        isResHeadersRequired: true,
      },
    };
    const body = {
      mobile,
      referenceAuthId: mobile,
    };

    Logger.debug("Idegde domain ott request params", { body, options });
    const response: any = await this.apiHelper.postData(options, body);
    Logger.debug("Idegde domain ott response", {
      headers: response.headers,
    });
    return response.headers["one-time-token"];
  }
}

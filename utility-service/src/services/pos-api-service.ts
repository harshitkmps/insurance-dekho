import { Inject, Service } from "typedi";
import { logger } from "@/utils/logger";
import CommonApiHelper from "./helpers/common-api-helper";

@Service()
export default class PosApiService {
  @Inject()
  private apiHelper: CommonApiHelper;

  public async getGstData(data: any): Promise<any> {
    try {
      const options = {
        endpoint: process.env.API_POS_ENDPOINT + "/v1/user/gst",
      };
      const params = {
        iamUuid: data.iamUuid,
        pan: data.pan,
      };
      logger.info(`get GST API request params`, {
        requestParams: {
          params,
          options,
        },
      });
      const gstData: any = await this.apiHelper.fetchData(options, params);
      logger.info("get GST API response received");
      return gstData;
    } catch (err) {
      logger.error("get GST API error", { err });
      return err;
    }
  }
}

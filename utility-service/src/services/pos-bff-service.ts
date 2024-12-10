import { Inject, Service } from "typedi";
import { logger } from "@/utils/logger";
import CommonApiHelper from "./helpers/common-api-helper";

@Service()
export default class PosBffService {
  @Inject()
  private apiHelper: CommonApiHelper;

  public async getLeadsData(options: any, params: any): Promise<any> {
    try {
      logger.debug(`get manage leads API request params`, {
        params,
        options,
      });
      const leadsData: any = await this.apiHelper.getData(options, params);
      logger.debug("get manage leads API response received");
      return { response: leadsData, err: null };
    } catch (err) {
      logger.error("get manage leads error", { err });
      return { response: null, err };
    }
  }
}

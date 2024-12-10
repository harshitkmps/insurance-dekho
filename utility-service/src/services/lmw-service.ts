import { Inject, Service } from "typedi";
import { logger } from "@/utils/logger";
import CommonApiHelper from "./helpers/common-api-helper";

@Service()
export default class LmwService {
  @Inject()
  private apiHelper: CommonApiHelper;

  public async getCaseListingData(options: any, params: any): Promise<any> {
    try {
      logger.debug(`get case listing leads v2 API request params`, {
        params,
        options,
      });
      const caseListingData: any = await this.apiHelper.postData(
        options,
        params
      );
      logger.debug("get case listing leads v2 API response", {
        meta: caseListingData.meta,
      });
      if (caseListingData?.meta?.statusCode === 400) {
        return { response: null, err: caseListingData };
      }
      return { response: caseListingData, err: null };
    } catch (err) {
      logger.error("get case listing leads error", { err });
      return { response: null, err };
    }
  }
}

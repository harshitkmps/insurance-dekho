import { Injectable, Logger } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";

@Injectable()
export default class HospicashService {
  constructor(private apiHelper: CommonApiHelper) {}

  public async getCommission(leadId: String, params: Object): Promise<any> {
    Logger.debug("fetching commission lmw", params);
    const options = {
      endpoint: `${process.env.LMW_URL}non-motor-lmw/hospicash/v1/getCommission/${leadId}`,
    };
    const leadResponse: any = await this.apiHelper.fetchData(options, params);
    Logger.debug("lmw commission response", leadResponse);
    return leadResponse.data;
  }
}

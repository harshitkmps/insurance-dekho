import { Injectable, Logger } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";

@Injectable()
export default class LifeLeadService {
  constructor(private apiHelper: CommonApiHelper) {}

  public async createLead(params: any): Promise<any> {
    const options = {
      endpoint: `${process.env.API_LMW_ENDPOINT}/api/life/v1/lead`,
    };
    Logger.debug("creating Life lead", { options, params });
    const res = await this.apiHelper.postData(options, params);
    Logger.debug("Life create lead response", res);
    return res.data;
  }
}

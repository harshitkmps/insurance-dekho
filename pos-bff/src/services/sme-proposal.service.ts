import { Injectable, Logger } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";

@Injectable()
export default class SmeProposalService {
  constructor(private apiHelper: CommonApiHelper) {}

  public async submitSmeProposalPos(
    // not used
    params: any,
    masterGCDCode: string,
    gcdCode: string
  ): Promise<any> {
    const options = {
      endpoint:
        process.env.API_LMW_ENDPOINT +
        `/api/v1/proposal/submit/${params.leadId}`,
    };
    Logger.debug("Sme proposal submission endpoint POS", {
      options,
      params,
    });
    const queryParams = {
      ...params,
      masterGCDCode,
      gcdCode,
    };
    const leadDetailsResponseData: any = await this.apiHelper.fetchData(
      options,
      queryParams
    );
    Logger.debug("proposal submission Response POS", leadDetailsResponseData);
    return leadDetailsResponseData.data;
  }

  public async getSmeProposalInfo(reqQuery: any, showScoreCard: any) {
    const queryParams = {
      ...reqQuery,
      showRewards: showScoreCard || false,
    };
    const options = {
      endpoint: process.env.API_LMW_ENDPOINT + `/api/v1/proposal`,
    };

    const leadDetails: any = await this.apiHelper.fetchData(
      options,
      queryParams
    );
    Logger.debug("proposal submission Response", leadDetails);
    return leadDetails.data;
  }

  public async submitSmeProposalApp(
    params: any,
    channelName: String,
    gcdCode: String,
    channelCity: String,
    channelType: String,
    channelSubType: String
  ): Promise<any> {
    const options = {
      endpoint:
        process.env.API_LMW_HEALTH_URL +
        `/health/proposer/send-final-proposal-details`,
    };
    Logger.debug("health proposal submission endpoint App", {
      options,
      params,
    });
    const body = {
      ...params,
      channelName,
      gcdCode,
      channelCity,
      channelType,
      channelSubType,
    };
    const leadDetailsResponseData: any = await this.apiHelper.postData(
      options,
      body
    );
    Logger.debug("proposal submission Response App", leadDetailsResponseData);
    return leadDetailsResponseData.data;
  }

  public async getCommission(
    leadId: String,
    params: Object,
    product: String
  ): Promise<any> {
    Logger.debug("fetching commission lmw", params);
    const options = {
      endpoint: `${process.env.LMW_URL}non-motor-lmw/${product}/v1/getCommission/${leadId}`,
    };
    const leadResponse: any = await this.apiHelper.fetchData(options, params);
    Logger.debug("lmw commission response", leadResponse);
    return leadResponse.data;
  }
}

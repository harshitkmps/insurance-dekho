import { Injectable, Logger } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import { UseCache } from "../decorators/use-cache.decorator";

@Injectable()
export default class ApiBrokerageService {
  constructor(private apiHelper: CommonApiHelper) {}

  public async getCommonCvInsurersList(params: any): Promise<any> {
    const options = {
      endpoint: `${process.env.API_BROKERAGE_ENDPOINT}/api/v1/common/cvInsurers`,
    };
    Logger.debug("get common cv insurers list API params ", {
      options,
      params,
    });
    const response: any = await this.apiHelper.fetchData(options, params);
    Logger.debug("received reponse for cv insurers list");
    return response.data;
  }

  public async getMasterMMVList(queryUrl: string, params: any): Promise<any> {
    const options = {
      endpoint: `${process.env.API_MASTER_URL}/api/v1/motor/getBkgMasterData${queryUrl}`,
    };
    Logger.debug("get master MMV list API params ", { options, params });
    const response: any = await this.apiHelper.fetchData(options, params);
    Logger.debug("get master MMV list API response received");
    return response;
  }

  // with state names also
  public async getMasterCityList(params: any): Promise<any> {
    const options = {
      endpoint: `${process.env.API_MASTER_URL}/api/v1/motor/getBkgMasterData`,
    };
    Logger.debug("get master city list brokerage API params", {
      options,
      params,
    });
    const response: any = await this.apiHelper.fetchData(options, params);
    Logger.debug("received response from master city list brokerage");
    return response.data;
  }

  @UseCache({ expiryTimer: 600, useObjectAsKey: true })
  public async getInsurerMasterRules(params: any): Promise<any> {
    try {
      const options = {
        endpoint: process.env.API_MASTER_URL + "/api/v1/motor/insurersMaster",
      };
      Logger.log("fetching insurer master rules from brokerage", {
        options,
        params,
      });
      const response = await this.apiHelper.postData(options, params);
      return response.data;
    } catch (error) {
      Logger.error(
        "Error while fetching insurer master rules for params",
        params
      );
      throw error;
    }
  }

  @UseCache({ expiryTimer: 60 * 60, useObjectAsKey: true })
  public async getPincodeDetails(params: any): Promise<any> {
    try {
      const options = {
        endpoint: `${process.env.API_BROKERAGE_ENDPOINT}/api/v1/common/getPincodeDetails`,
      };
      const response: any = await this.apiHelper.fetchData(options, params);
      return response?.data;
    } catch (error) {
      Logger.error("Error while fetching pincode details", error);
      throw error;
    }
  }
}

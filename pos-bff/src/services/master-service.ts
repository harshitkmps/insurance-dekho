import { Injectable, Logger } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import { UseCache } from "../decorators/use-cache.decorator";
import { SubProductTypeId } from "../constants/master-data.constants";
import ApiBrokerageService from "./api-brokerage-service";
import {
  MasterInsurerDataResponse,
  MasterPetDataResponse,
} from "../interfaces/master/master-data-response.interface";
import { CityResponse } from "../interfaces/sfa/city-response.interface";

@Injectable()
export default class MasterAPIService {
  constructor(
    private apiHelper: CommonApiHelper,
    private apiBrokerageService: ApiBrokerageService
  ) {}

  @UseCache()
  public async getMasterInsurerListForPet(): Promise<MasterInsurerDataResponse> {
    const options = {
      source: "POS",
      subSource: "INSURANCEDEKHO",
      medium: "INSURANCEDEKHO",
      masterType: "insurer",
      subProductTypeId: 8,
    };
    const response: MasterInsurerDataResponse = await this.getMasterData(
      options
    );
    return response;
  }

  @UseCache()
  public async getMasterInsurerListForTravel(): Promise<MasterInsurerDataResponse> {
    const options = {
      source: "POS",
      subSource: "INSURANCEDEKHO",
      medium: "INSURANCEDEKHO",
      masterType: "insurer",
      subProductTypeId: 7,
    };
    const response: MasterInsurerDataResponse = await this.getMasterData(
      options
    );
    return response;
  }
  @UseCache()
  public async getMasterCityList(): Promise<CityResponse> {
    Logger.debug("fetching master cities list");
    const options = {
      endpoint: process.env.SFA_CITY_DATA_ENDPOINT,
    };
    const cityResponse: CityResponse = await this.apiHelper.fetchData(
      options,
      {}
    );
    return cityResponse;
  }
  @UseCache()
  public async getMasterListForPet(): Promise<MasterPetDataResponse> {
    Logger.debug("fetching master pet data list");
    const options = {
      source: "POS",
      subSource: "INSURANCEDEKHO",
      medium: "INSURANCEDEKHO",
      masterType: "breeds",
      subProductTypeId: 8,
    };
    const response: MasterPetDataResponse = await this.getMasterData(options);
    return response;
  }

  @UseCache({ expiryTimer: 600 })
  public async getMasterDataForInsurers(
    productType: string
  ): Promise<MasterInsurerDataResponse> {
    try {
      Logger.debug(
        `fetching master data insurer for productType ${productType}`
      );
      const options = {
        source: "B2B",
        subSource: "POS",
        medium: "POS",
        masterType: "insurer",
        subProductTypeId: SubProductTypeId[productType],
        limit: -1,
      };
      const response: MasterInsurerDataResponse = await this.getMasterData(
        options
      );
      return response;
    } catch (err) {
      Logger.error("error in get master data for insurer API", { err });
      return { insurers: [] };
    }
  }

  @UseCache({ expiryTimer: 60 * 30, useObjectAsKey: true })
  public async getMasterData(params: Object): Promise<any> {
    Logger.debug("fetching master data list with params ", params);
    const options = {
      endpoint: process.env.MASTER_DATA_ENDPOINT,
    };
    const masterDataResponse: any = await this.apiHelper.fetchData(
      options,
      params
    );
    return masterDataResponse.data;
  }

  @UseCache({ expiryTimer: 7200 })
  public async getTenantDetails(): Promise<any> {
    Logger.debug("fetching tenant master data for every tenant");
    const options = {
      endpoint: `${process.env.BROKERAGE_MASTER_URL}api/v1/master/tenant`,
    };
    const params = {};
    const masterDataResponse: any = await this.apiHelper.fetchData(
      options,
      params
    );
    Logger.debug("received tenant details");
    return masterDataResponse.data;
  }

  public async getLocality(localityId, pinCode): Promise<any> {
    Logger.debug(`fetching locality details for localityId : ${localityId}`);
    const areaResponse = await this.getAreaDetailsByPinCode(pinCode);
    const areas =
      areaResponse && areaResponse.length ? areaResponse[0].areas : null;
    if (areas && areas.length > 0) {
      for (const area of areas) {
        if (area["id"] == localityId) {
          return area["areaName"];
        }
      }
    }
    return "";
  }

  @UseCache({ expiryTimer: 2 * 60 * 60 })
  public async getAreaDetailsByPinCode(pinCode): Promise<any> {
    Logger.debug(`fetching area details for pincode : ${pinCode}`);
    const options = {
      endpoint: `${process.env.BROKERAGE_MASTER_URL}api/v1/master/pincode`,
    };
    const params = {
      pincode: pinCode,
      groupBy: "area",
      subSource: "partnerPortalWeb",
    };
    const masterDataResponse: any = await this.apiHelper.fetchData(
      options,
      params
    );
    return masterDataResponse.data;
  }

  @UseCache({ expiryTimer: 7200 })
  public async getPincodeByCityId(cityId): Promise<any> {
    const options = {
      endpoint: `${process.env.MASTER_DATA_ENDPOINT_URL}/pincode`,
    };
    const params = {
      limit: -1,
      cityId,
    };
    const masterDataResponse: any = await this.apiHelper.fetchData(
      options,
      params
    );
    const pincodes = masterDataResponse?.data?.map((item) => ({
      value: item.pincode,
      label: item.pincode?.toString(),
    }));
    return pincodes;
  }

  @UseCache({ expiryTimer: 600, useObjectAsKey: true })
  public async getKycConfig(params: any): Promise<any> {
    try {
      Logger.log("get kyc config from master");
      const options = {
        endpoint: `${process.env.BROKERAGE_MASTER_URL}api/v1/master/kyc/config`,
      };
      const masterDataResponse: any = await this.apiHelper.fetchData(
        options,
        params
      );
      return masterDataResponse.data;
    } catch (error) {
      Logger.error("error while fetching kyc config", error);
      throw error;
    }
  }

  @UseCache({ expiryTimer: 60 * 60, useObjectAsKey: true })
  public async getCVInsurers(params: any): Promise<any> {
    const insurersConfigs =
      await this.apiBrokerageService.getCommonCvInsurersList(params);
    const insurersArr = [];
    for (const insurerId in insurersConfigs) {
      if (!insurerId) {
        continue;
      }
      insurersArr.push({
        insurerId: Number(insurerId),
        insurerName: insurersConfigs[insurerId],
      });
    }
    return insurersArr;
  }

  @UseCache({ expiryTimer: 600, useObjectAsKey: true })
  public async getMasterConfigData(
    path: string,
    params: any,
    method: string
  ): Promise<any> {
    const newBrokerageMaster = path.includes("br2");
    const apiPath = path.includes("br2")
      ? path.split("br2/")[1]
      : path.split("br1/")[1];
    const parameters = {
      ...params,
    };
    const masterEndpoint = newBrokerageMaster
      ? process.env.MASTER_API_BASE_URL_2
      : process.env.MASTER_API_BASE_URL;
    const options = {
      endpoint: `${masterEndpoint}/api/v1/${apiPath}`,
      method,
    };
    const masterDataResponse: any = await this.apiHelper.getData(
      options,
      parameters
    );
    return masterDataResponse.data;
  }
}

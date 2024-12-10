import { Injectable, Logger } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import { AxiosResponse } from "axios";
import { ConfigService } from "@nestjs/config";

@Injectable()
export default class UtilityService {
  constructor(
    private apiHelper: CommonApiHelper,
    private configService: ConfigService
  ) {}

  public async uploadData(
    type: string,
    apiParams: any,
    headers: any,
    source: string,
    email: string,
    file: any,
    data: []
  ): Promise<any> {
    const body = {
      apiParams,
      source,
      file,
      email,
      type,
      data,
    };

    const utilityEndpoint = this.configService.get("UTILITY_SERVICE_ENDPOINT");

    const options = {
      endpoint: `${utilityEndpoint}/api/v1/upload`,
      config: {
        headers,
      },
    };
    const res: AxiosResponse<any> = await this.apiHelper.postData(
      options,
      body
    );
    Logger.debug("response received from upload API", res);
    return res.data;
  }

  public async downloadData(
    type: string,
    apiParams: any,
    headers: any,
    requestSource: string,
    name: string,
    email: string,
    uuid: string,
    endpoint: string,
    csvHeadings?: any
  ): Promise<any> {
    const body = {
      apiParams,
      requestSource,
      name,
      email,
      uuid,
      type,
      csvHeadings,
    };

    const utilityEndpoint = this.configService.get("UTILITY_SERVICE_ENDPOINT");
    const options = {
      endpoint: `${utilityEndpoint}/api/v1/download/${endpoint}`,
      config: {
        headers,
      },
    };
    const res: AxiosResponse<any> = await this.apiHelper.postData(
      options,
      body
    );
    return res.data;
  }

  public async getConfig(configKey: string): Promise<any> {
    const utilityEndpoint = this.configService.get("UTILITY_SERVICE_ENDPOINT");

    const params = {
      configKey,
    };
    const options = {
      endpoint: `${utilityEndpoint}/api/v1/config`,
    };
    const res: AxiosResponse<any> = await this.apiHelper.fetchData(
      options,
      params
    );
    return res.data;
  }
}

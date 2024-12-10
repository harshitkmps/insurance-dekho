import { DataProviderFactory } from "./cases-listing/data-provider-factory";
import { transform } from "node-json-transform";
import { Injectable, Logger } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import { Request } from "express";

@Injectable()
export default class GenericAPIService {
  constructor(
    public dataProviderFactory: DataProviderFactory,
    public apiHelper: CommonApiHelper
  ) {}

  public async getData(request: Request, propertiesMap: any): Promise<any> {
    const dataProvider = await this.dataProviderFactory.getDataProvider(
      propertiesMap["dataProvider"]
    );
    const dataProviderResponse = await dataProvider.getData(
      request,
      propertiesMap
    );
    const mapper = await this.dataProviderFactory.getMapper(
      propertiesMap["mapper"]
    );
    if (mapper === null) {
      return dataProviderResponse;
    }
    const transformedResponse = transform(dataProviderResponse, mapper);
    Logger.debug("response after transformation", transformedResponse);
    return transformedResponse;
  }
}

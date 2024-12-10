import { Injectable, Logger } from "@nestjs/common";
import { properties } from "../../config/properties";
import NonMotorLMWCaseListingService from "./non-motor-lmw-case-listing-service";

@Injectable()
export class DataProviderFactory {
  constructor(private nonMotorLMWCaseListing: NonMotorLMWCaseListingService) {}

  public async getMapper(view: any): Promise<any> {
    try {
      const mapper = await import("../../dtos/mapper/" + view);
      if (mapper === null) {
        return null;
      }
      return mapper.mapper;
    } catch (error) {
      Logger.debug("Mapper not implemented.");
      return null;
    }
  }
  public async getDataProvider(k: any): Promise<any> {
    if (k === "non-motor-lmw") {
      return this.nonMotorLMWCaseListing;
    }
    throw new Error("no implementation found");
  }

  public async getProperies(k: string) {
    Logger.debug("fetching properties for ", k);
    return properties[k];
  }
}

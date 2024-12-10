import { Injectable, Logger } from "@nestjs/common";
import { UseCache } from "../decorators/use-cache.decorator";
import ApiBrokerageService from "./api-brokerage-service";

@Injectable()
export default class MMVService {
  constructor(private apiBrokerageService: ApiBrokerageService) {}

  @UseCache({ expiryTimer: 10800 }) // 3hr
  public async getMMVData(
    vehicleType: string,
    insurerId: string,
    categoryId: string
  ): Promise<any> {
    Logger.debug("fetching vehicle type from params ", {
      vehicleType,
      categoryId,
      insurerId,
    });
    let queryUrl =
      "?fetchData=fw_mmv&tags=make,make_id,model,model_id,version,version_id,version_display_name,cc,seats,status,fuel,parent_id,popularity_rank,model_popularity_rank,childVersionIds";
    if (vehicleType === "bike") {
      queryUrl = "?fetchData=tw_mmv";
    } else if (vehicleType === "commercial") {
      queryUrl = "?fetchData=cfw_mmv&categoryId=";
      queryUrl += categoryId || "8,9,4";
    }
    queryUrl += insurerId ? `&insurer_id=${insurerId}` : "";
    const params = {};
    const response = await this.apiBrokerageService.getMasterMMVList(
      queryUrl,
      params
    );
    return response;
  }

  public async getMMVMakeModel(
    vehicleType: string,
    insurerId: string,
    categoryId: string,
    makeId: string
  ): Promise<any> {
    Logger.debug("fetching vehicle type from params for make ", {
      vehicleType,
      categoryId,
      insurerId,
      makeId,
    });
    let queryUrl = "?fetchData=fw_mmv";
    if (vehicleType === "bike") {
      queryUrl = "?fetchData=tw_mmv";
    } else if (vehicleType === "commercial") {
      queryUrl = "?fetchData=cfw_mmv&categoryId=";
      queryUrl += categoryId || "8,9,4";
    }
    queryUrl += insurerId ? `&insurer_id=${insurerId}` : "";
    queryUrl += makeId
      ? `&makeId=${makeId}&fetchOnly=all_model`
      : "&fetchOnly=all_make";
    const params = {};
    const response = await this.apiBrokerageService.getMasterMMVList(
      queryUrl,
      params
    );
    // Logger.debug("MMV make and model data is fetched", response);
    return response;
  }
}

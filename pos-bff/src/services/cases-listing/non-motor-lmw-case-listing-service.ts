import { Roles } from "../../constants/roles.constants";
import { Injectable, Logger } from "@nestjs/common";
import { Request } from "express";
import EncryptionService from "../encryption-service";
import CommonApiHelper from "../helpers/common-api-helper";
import MasterAPIService from "../master-service";
import {
  InsurerData,
  MasterInsurerDataResponse,
  MasterPetDataResponse,
} from "../../interfaces/master/master-data-response.interface";
import { CityResponse } from "../../interfaces/sfa/city-response.interface";
import { ReqWithUser } from "@/src/interfaces/request/req-with-user.interface";

@Injectable()
export default class NonMotorLMWCaseListingService {
  constructor(
    private apiHelper: CommonApiHelper,
    private masterApiService: MasterAPIService,
    private encryptionService: EncryptionService
  ) {}

  public async getData(request: Request, propertiesMap: any): Promise<any> {
    Logger.debug(
      `fetching case listing for ${propertiesMap["productType"]} with request`,
      request.body
    );
    if (propertiesMap["apiName"] === "case-listing") {
      return this.getCaseListResponse(request, propertiesMap);
    }
    if (propertiesMap["apiName"] === "count") {
      return this.getCountResponse(request, propertiesMap);
    }
  }
  private async getCountResponse(
    request: Request,
    propertiesMap: any
  ): Promise<any> {
    const options = propertiesMap["options"];
    const requestBody = await this.buildRequest(request, propertiesMap);
    const response: any = await this.apiHelper.getData(options, requestBody);
    return response;
  }
  private async getCaseListResponse(
    request: Request,
    propertiesMap: any
  ): Promise<any> {
    const options = propertiesMap["options"];
    const requestBody = await this.buildRequest(request, propertiesMap);
    const response = await this.apiHelper.getData(options, requestBody);
    try {
      const responseWithInsurerDetails = await this.addAdditionalDetails(
        response,
        propertiesMap
      );
      return responseWithInsurerDetails;
    } catch (error) {
      Logger.error("error while adding additional details ", error.message);
    }
    return response;
  }
  async buildRequest(request: ReqWithUser, propertiesMap: any) {
    const filters = request.body.filters ? request.body.filters : {};
    if (filters.mobile) {
      const encryptionRequest = [filters.mobile];
      const encryptedMobileData = await this.encryptionService.encrypt(
        encryptionRequest
      );
      if (encryptedMobileData && encryptedMobileData[0].ecrypted) {
        filters["proposerDetails.mobile"] = encryptedMobileData[0].ecrypted;
        delete filters.mobile;
      }
    }
    if (filters.policyNumber) {
      filters["policyDetails.policyNumber"] = filters.policyNumber;
      delete filters.mobile;
    }
    if (filters.firstName) {
      filters["proposerDetails.firstName"] = filters.firstName;
      delete filters.firstName;
    }
    const userInfo = request.userInfo;
    if (userInfo) {
      delete filters["salesIamId"];
      if (
        userInfo.pos_role_id === Roles.POS_AGENT ||
        userInfo.pos_role_id === Roles.POS_SUB_AGENT
      ) {
        filters["channelIamId"] = userInfo["uuid"];
      } else if (userInfo.pos_role_id === Roles.POS_EXECUTIVE) {
        filters["creatorIamId"] = userInfo["uuid"];
      } else if (
        userInfo.pos_role_id === Roles.POS_SUPER_ADMIN ||
        userInfo.pos_role_id === Roles.POS_ADMIN
      ) {
        delete filters["salesIamId"];
        delete filters["channelIamId"];
      } else {
        filters["salesIamId"] = userInfo["uuid"];
      }
    }
    const body = {
      medium: request.body.medium,
      filters: JSON.stringify(filters),
      productType: propertiesMap["productType"],
      projection: propertiesMap["projection"],
    };
    if (request.body.limit) {
      body["limit"] = request.body.limit;
    }
    if (request.body.nextCursor) {
      body["nextCursor"] = request.body.nextCursor;
    }
    if (request.body.previousCursor) {
      body["previousCursor"] = request.body.previousCursor;
    }
    return body;
  }
  private async addAdditionalDetails(response: any, propertiesMap: any) {
    let masterInsurerDetails: MasterInsurerDataResponse = null;
    if (propertiesMap.productType === "travel") {
      masterInsurerDetails =
        await this.masterApiService.getMasterInsurerListForTravel();
    }
    if (propertiesMap.productType === "pet") {
      masterInsurerDetails =
        await this.masterApiService.getMasterInsurerListForPet();
    }
    const insurerDetails: InsurerData[] =
      masterInsurerDetails != null ? masterInsurerDetails.insurers : [];
    const cityResponse: CityResponse =
      await this.masterApiService.getMasterCityList();
    const cityDetails: any[] = cityResponse.data;
    const masterPetDetails: MasterPetDataResponse =
      await this.masterApiService.getMasterListForPet();
    const petDetails: any[] = masterPetDetails.breeds;
    response.data.forEach((element) => {
      if (element.selectedQuotes) {
        const insurerId = element.selectedQuotes.insurerId;
        const insurerDetail = insurerDetails.find(
          (detail) => detail.insurerId === insurerId
        );
        if (insurerDetail) {
          element.selectedQuotes["insurerName"] = insurerDetail.insurerName;
          element.selectedQuotes["insurerLogo"] = insurerDetail.insurerLogo;
          element.selectedQuotes["insurerImage"] = insurerDetail.insurerImage;
        }
      }
      if (element.communicationDetails) {
        const cityId = element.communicationDetails.cityId;
        const cityDetail = cityDetails.find(
          (detail) => detail.cityId === parseInt(cityId)
        );
        if (cityDetail) {
          element.communicationDetails["cityName"] = cityDetail.displayName;
        }
      }
      if (propertiesMap["productType"] === "pet") {
        if (element.insuredMembers) {
          const breedId = element.insuredMembers[0].breedId;
          const breedDetail = petDetails.find(
            (detail) => detail.id === breedId
          );
          if (breedDetail) {
            element.insuredMembers[0]["breedName"] = breedDetail.name;
            element.insuredMembers[0]["breedLogo"] = breedDetail.breedLogo;
          }
        }
      }
    });
    return response;
  }

  private async buildCountRequest(request: ReqWithUser, propertiesMap: any) {
    const filters = request.body.filters ? request.body.filters : {};
    if (filters.mobile) {
      filters["proposerDetails.mobile"] = filters.mobile;
      delete filters.mobile;
    }
    if (filters.policyNumber) {
      filters["policyDetails.policyNumber"] = filters.policyNumber;
      delete filters.mobile;
    }
    if (filters.firstName) {
      filters["proposerDetails.firstName"] = filters.firstName;
      delete filters.firstName;
    }
    const userInfo = request.userInfo;
    if (userInfo) {
      delete filters["salesIamId"];
      if (userInfo.pos_role_id === 3 || userInfo.pos_role_id === 4) {
        filters["channelIamId"] = userInfo["uuid"];
      } else {
        filters["salesIamId"] = userInfo["uuid"];
      }
    }
    const body = {
      medium: request.body.medium,
      filters: JSON.stringify(filters),
      productType: propertiesMap.productType,
      projection:
        "booked,cancel,payment,proposal,quoteSelected,leadGenerated,policyDocUnavailable,policyDocAvailable,confirmationPending,paymentFailed,paymentPending,paymentSuccess,paymentLinkExpired,proposalFailed,paymentLinkShared,paymentLinkGenerated,proposalPending",
    };
    return body;
  }
}

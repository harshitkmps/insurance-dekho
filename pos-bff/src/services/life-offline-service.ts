/* eslint-disable prettier/prettier */
import { Logger, Injectable } from "@nestjs/common";
import ItmsService from "../core/api-helpers/itms-service";
import CommonApiHelper from "./helpers/common-api-helper";
import { LifeOfflineCreateRequestInterface } from "../interfaces/life-offline/create-request-interface";
import { buildCreateLifeOfflineRequest } from "../dtos/mapper/life-offline";
import ContextHelper from "./helpers/context-helper";
import TenantService from "./tenant-service";
import DealerService from "./dealer-service";
import { NonAgentSalesRoles } from "../constants/pos-roles.constants";
import LifeUtils from "../utils/life-utils";
import MasterAPIService from "./master-service";

@Injectable()
export default class LifeOfflineService {
  constructor(
    private itmsService: ItmsService,
    private apiHelper: CommonApiHelper,
    private tenantService: TenantService,
    private dealerService: DealerService,
    private masterApiService: MasterAPIService
  ) {}

  public async createLifeOfflineRequest(
    userDetails: any,
    reqBody: any
  ): Promise<any> {
    const context = ContextHelper.getStore();
    const queryParams = {
      requestSource: context.get("medium"),
    };
    const promises = [
      this.tenantService.getTenantDetailsFromMaster(userDetails, queryParams),
    ];

    if (!NonAgentSalesRoles.includes(userDetails.pos_role_id)) {
      promises.push(
        this.dealerService.getDealerDetails({
          iam_uuid: reqBody.dealerId,
        })
      );
    } else {
      promises.push(null);
    }

    const [tenantInfo, userInfo] = await Promise.all(promises);
    const body: LifeOfflineCreateRequestInterface =
      await buildCreateLifeOfflineRequest(
        reqBody,
        userDetails,
        tenantInfo,
        userInfo
      );
    Logger.debug("life offline ITMS request", body);
    const res = await this.itmsService.createLifeOfflineTicket(body);
    Logger.debug("motor offline create response", res);
    return res;
  }

  public async getLifeOfflineRequest(ticketId: string) {
    const itmsResponse = await this.itmsService.getLifeOfflineDetails(ticketId);
    const response = itmsResponse;
    return response;
  }

  public async getDocumentsList(params: Object): Promise<any> {
    const path = "br2/insurer-master/document-list";

    const documentsList: any = await this.masterApiService.getMasterConfigData(
      path,
      params,
      "GET"
    );

    if (documentsList) {
      const restructuredDocuments = LifeUtils.restructureDocuments(
        params,
        documentsList
      );
      return restructuredDocuments;
    }
  }
}

import DealerService from "../services/dealer-service";
import { HttpStatus, Logger, Query } from "@nestjs/common";
import { Controller, Get, Req, Res } from "@nestjs/common";
import { sendResponse } from "../services/helpers/response-handler";
import SalesService from "../services/sales-service";
import { Request, Response } from "express";
import CommonUtils from "../utils/common-utils";
// import authMiddleware from "@middlewares/auth.middleware";
import { PosInternalRoles, PosRoles } from "../constants/pos-roles.constants";
import EncryptionService from "../services/encryption-service";
import PartnerConnectService from "../services/partner-connect-service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { DealerHierarchyAuth } from "../decorators/dealer-hierarchy-auth.decorator";
import { GetDealerByUuidQuery } from "../dtos/sfa/get-dealer-by-uuid.dto";

@Controller("")
@ApiTags("Sales Profile")
export class SalesProfileController {
  constructor(
    private dealerService: DealerService,
    private salesProfileService: SalesService,
    private encryptionService: EncryptionService,
    private partnerConnectService: PartnerConnectService
  ) {}

  @Get("/dealers")
  @ApiOperation({
    summary: "Return a list of dealers based on filters provided",
    parameters: [
      {
        name: "getDealerByReportingManager",
        in: "query",
        example: "true,false",
      },
      {
        name: "getHierarchyUsers",
        in: "query",
        example: "true,false",
      },
      {
        name: "getCitiesByReportingManager",
        in: "query",
        example: "true,false",
      },
      {
        name: "onboarded_on_general",
        in: "query",
      },
      {
        name: "onboarded_on_life",
        in: "query",
      },
      {
        name: "name",
        in: "query",
      },
      {
        name: "limit",
        in: "query",
      },
      {
        name: "projection",
        in: "query",
        example:
          "id,organization,city_id,reporting_sfa_id,email,mobile,gcd_code,dealer_id",
      },
      {
        name: "reporting_sfa_uuids",
        in: "query",
        example: "290ac96c-2f07-4f86-acd8-530c82c3910f",
      },
      {
        name: "city_id",
        in: "query",
        example: "49",
      },
      {
        name: "starting_row_number",
        in: "query",
      },
    ],
  })
  @UserAuth(...PosInternalRoles)
  async getDealers(@Req() request: ReqWithUser, @Res() response: Response) {
    Logger.debug("received request ", { params: request.query });

    const params: any = request.query;
    const product: string = params.product;
    const userInfo = request.userInfo;
    const teams = userInfo?.teams;
    const teamUuid = teams?.[product]?.teamUuid;

    if (!params.reporting_sfa_uuids) {
      params.reporting_sfa_uuids = userInfo?.uuid;
    }

    if (!params.getHierarchyUsers) {
      params.getHierarchyUsers = true;
    }

    if (product) {
      if (teams && !teamUuid) {
        Logger.error(
          `Sales user ${userInfo?.uuid} doesnt have a team assigned for product ${product}`
        );
        return sendResponse(request, response, 204, "no data found", []);
      }
      if (teamUuid) params["team_uuids"] = teamUuid;
    }

    const data = await this.dealerService.getDealers(params);
    if (!data.data.length) {
      return sendResponse(request, response, 204, "no dealers found", data);
    }
    return sendResponse(
      request,
      response,
      200,
      "dealers fetched successfully",
      data
    );
  }

  @Get("/v1/dealers")
  @UserAuth(...PosInternalRoles)
  async getDealersList(@Req() request: ReqWithUser, @Res() response: Response) {
    Logger.debug("received request ", { params: request.query });
    const userInfo = request.userInfo;
    const product = request.query.product as string;
    const teams = userInfo?.teams;
    const teamUuid = teams?.[product]?.teamUuid;
    if (product) {
      if (teams && !teamUuid) {
        Logger.error(
          `Sales user ${userInfo.uuid} doesnt have a team assigned for product ${product}`
        );
        return sendResponse(request, response, 204, "no team found", []);
      }
    }
    const params = await this.getParams(request);
    const data = await this.dealerService.getDealers(params);
    if (data.data && !data.data.length) {
      return sendResponse(request, response, 204, "no dealers found", data);
    }
    if (params["dealerId"]) {
      const dealerData = this.mapResponse(data);
      return sendResponse(
        request,
        response,
        200,
        "dealers details successfully",
        dealerData
      );
    }
    return sendResponse(
      request,
      response,
      200,
      "dealers fetched successfully",
      data
    );
  }

  @Get("/v2/dealers")
  @UserAuth(...PosInternalRoles)
  async getDealersListV2(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    Logger.debug("received request v2/dealers", { params: request.query });
    const params = await this.getParams(request);
    const data = await this.dealerService.getDealersV2(params);
    if (data.data && !data.data.length) {
      return sendResponse(request, response, 204, "no dealers found", data);
    }

    if (request.query?.getDecryptedMobileEmail === "true") {
      const dealerData = data;
      dealerData.data = await this.partnerConnectService.prepareData(
        dealerData.data
      );
      return sendResponse(
        request,
        response,
        200,
        "dealers fetched successfully",
        dealerData
      );
    }

    return sendResponse(
      request,
      response,
      200,
      "dealers fetched successfully",
      data
    );
  }

  @Get("/v1/dealers/:dealerUuid")
  @ApiOperation({ summary: "Get dealer info by dealer uuid" })
  @DealerHierarchyAuth({
    uuidPath: "params.dealerUuid",
    teamUuidPath: "query.teamUuid",
  })
  @UserAuth(...PosInternalRoles)
  async getDealerInfo(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Query() query: GetDealerByUuidQuery
  ) {
    const data = await this.dealerService.getDealerByUuid(query);
    return sendResponse(req, res, HttpStatus.OK, "ok", data);
  }

  private mapResponse(data: any) {
    const responseArr = [];
    data.map((x) => {
      const ele = {
        gcd_code: x.gcd_code,
        dealer_id: x.dealer_id,
        organization: x.organization,
        city_id: x.city_id,
        name: x.name,
        iam_uuid: x.iam_uuid,
      };
      responseArr.push(ele);
    });
    return responseArr;
  }

  private async getParams(request: any) {
    const params = {};
    params["projection"] =
      "id,cps_id,organization,city_id,reporting_sfa_id,email,mobile,gcd_code,dealer_id,name,iam_uuid,work_address,address";

    params["status"] = 1;
    const userInfo = request.userInfo;
    if (userInfo) {
      if (request.query["dealerId"] != null) {
        params["dealerId"] = request.query["dealerId"];
        return params;
      }
      if (
        userInfo.pos_role_id !== 1 &&
        userInfo.pos_role_id !== 2 &&
        userInfo.pos_role_id !== 5 &&
        userInfo.pos_role_id !== 6 &&
        userInfo.pos_role_id !== 7
      ) {
        params["getDealerByReportingManager"] = true;
        params["getHierarchyUsers"] = true;
        if (request.query["salesUserIamId"]) {
          params["reporting_sfa_uuids"] = request.query["salesUserIamId"];
        } else {
          params["reporting_sfa_uuids"] = userInfo["uuid"];
        }
      } else {
        if (request.query["salesUserIamId"]) {
          params["getDealerByReportingManager"] = true;
          params["getHierarchyUsers"] = true;
          params["reporting_sfa_uuids"] = request.query["salesUserIamId"];
        } else if (request.query.fetchMappedDealers && request.query.product) {
          params["internalUserUUID"] = userInfo.uuid;
          params["product"] = request.query?.product?.toLowerCase();
        } else {
          params["getAllDealers"] = true;
        }
      }
      if (userInfo?.teams) {
        const product = request.query.product;
        if (product) {
          const teamUuid = userInfo.teams?.[product]?.teamUuid;
          if (teamUuid) {
            params["team_uuids"] = teamUuid;
          }
        }

        if (request?.query?.teamUuid) {
          params["team_uuids"] = request?.query?.teamUuid;
        }
      }
      if (request.query["city"] || request.query["city_id"]) {
        params["city_id"] = request.query["city"] ?? request.query["city_id"];
      }
      if (request.query["name"]) {
        params["search_text"] = request.query["name"];
      }
      if (request.query["gcd_code"]) {
        params["search_text"] = request.query["gcd_code"];
      }
      if (request.query["getAgentMapping"]) {
        params["getAgentMapping"] = true;
      }
      if (request.query["mobile"]) {
        request.query["mobile"] = parseInt(request.query["mobile"]);
        const encryptionRequest = [request.query["mobile"]];
        const encryptedMobileData = await this.encryptionService.encrypt(
          encryptionRequest
        );
        params["mobile"] = encryptedMobileData[0].ecrypted;
      }
      params["getAllDealers"] = true;
    }
    return params;
  }

  @Get("/cities")
  @ApiOperation({
    summary: "Return master list of cities",
  })
  async getCities(@Req() request: Request, @Res() response: Response) {
    Logger.debug("fetch cities ", { params: request.query });
    const cityData = await this.dealerService.getCityByDealer(request.query);
    if (!cityData.data.length) {
      return sendResponse(request, response, 204, "no cities found", []);
    }
    return sendResponse(
      request,
      response,
      200,
      "cities fetched successfully",
      cityData
    );
  }

  @Get("/sales-list")
  @UserAuth()
  @ApiOperation({
    summary: "Return Users under a sales profile",
  })
  async getSalesList(@Req() request: ReqWithUser, @Res() response: Response) {
    Logger.debug("fetching sales people ", { params: request.query });
    request.query.getUsersUnderReportingManager = true as any;
    if (request.userInfo) {
      const roleId = request.userInfo.pos_role_id;
      if (roleId == PosRoles.Agent || roleId == PosRoles.SubAgent) {
        return sendResponse(
          request,
          response,
          204,
          "sales list not available for agent",
          []
        );
      }
      if (
        request.userInfo.pos_role_id !== 1 &&
        request.userInfo.pos_role_id !== 2 &&
        request.userInfo.pos_role_id !== 5
      ) {
        request.query.reporting_sfa_uuids = request.userInfo.uuid;
      }
    }
    // override sfa-uuid if recieved from frontend
    if (request.params.salesIamId) {
      request.query.reporting_sfa_uuids = request.params.salesIamId;
    }
    if (request.query.product) {
      const product = request.query.product as string;
      request.query.team_uuids = request.userInfo?.teams?.[product]?.teamUuid;
    }
    if (request.query.salesIamId) {
      request.query.reporting_sfa_uuids = request.query.salesIamId;
      delete request.query.salesIamId;
    }
    if (request.query.teamUuid) {
      request.query.team_uuids = request.query.teamUuid;
      delete request.query.teamUuid;
    }

    const updatedQueryParams = CommonUtils.removeFalsyQueryParams(
      request.query
    );
    const salesPersonList = await this.salesProfileService.getSalesPersonList(
      updatedQueryParams
    );
    if (!salesPersonList.data.length) {
      return sendResponse(
        request,
        response,
        204,
        "no sales persons found found under given user",
        []
      );
    }
    return sendResponse(
      request,
      response,
      200,
      "sales persons successfully",
      salesPersonList
    );
  }

  @Get("/contact-info")
  @UserAuth()
  @ApiOperation({
    summary: "Return contact information of sales person tagged to a dealer",
  })
  async contactInfo(@Req() request: ReqWithUser, @Res() response: Response) {
    const userInfo = request.userInfo;
    if (userInfo) {
      const dealerId = userInfo["dealer_id"];
      Logger.debug(`fetching contact info for request for dealer ${dealerId}`);
      request.params.dealerId = dealerId;
      const contactInfoResponse =
        await this.dealerService.fetchContactInfoHeirarchyForAgents(
          request.params,
          userInfo
        );
      if (CommonUtils.isEmpty(contactInfoResponse)) {
        return sendResponse(
          request,
          response,
          204,
          "no contact info found for dealer",
          []
        );
      }
      return sendResponse(
        request,
        response,
        200,
        "sales persons successfully",
        contactInfoResponse
      );
    }
    return sendResponse(request, response, 200, "dealerId not found", []);
  }

  @Get("/v2/contact-info")
  @UserAuth()
  @ApiOperation({
    summary: "Return contact information for dealers team wise",
  })
  async contactInfoV2(@Req() request: ReqWithUser, @Res() response: Response) {
    const userInfo = request.userInfo;
    const dealerId = userInfo?.["dealer_id"];
    Logger.debug(`fetching team wise contact info for dealer ${dealerId}`);
    request.params.dealerId = dealerId;
    const contacts =
      await this.dealerService.fetchContactInfoHeirarchyForAgentsV2(
        request.params,
        userInfo
      );
    if (CommonUtils.isEmpty(contacts)) {
      return sendResponse(
        request,
        response,
        204,
        "no contact info found for dealer",
        []
      );
    }
    return sendResponse(
      request,
      response,
      200,
      "sales persons successfully",
      contacts
    );
  }
}

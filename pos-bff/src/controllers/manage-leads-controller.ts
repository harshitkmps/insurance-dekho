import { sendResponse } from "../services/helpers/response-handler";
import ManageLeadService from "../services/manage-lead-service";
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Controller, Get, Post, Req, Res } from "@nestjs/common";
import CommonApiHelper from "../services/helpers/common-api-helper";
import UtilityService from "../services/utility-service";
import LOSService from "../services/los-service";
import { MAP_UTM_SOURCE } from "../constants/manage-leads.constants";
import { PosRoles } from "../constants/pos-roles.constants";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { LeadAuth } from "../decorators/lead-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { Response } from "express";
import { SEARCH_FIELD } from "../constants/manage-leads.constants";
import moment from "moment";

@Controller()
@ApiTags("Manage Leads")
export class ManageLeadsController {
  constructor(
    private leadService: ManageLeadService,
    private utilityService: UtilityService,
    private losService: LOSService,
    private apiHelper: CommonApiHelper
  ) {}

  @Get("/leads/search")
  @UserAuth()
  @ApiOperation({
    summary: "Return a list of leads under a particular reporting manager",
    parameters: [
      {
        name: "from",
        in: "query",
        example: "2020-01-01",
      },
      {
        name: "to",
        in: "query",
        example: "2020-01-01",
      },
      {
        name: "uuid",
        in: "query",
        description: "IAM UUID of Sales User",
      },
      {
        name: "isAggregate",
        in: "query",
        example: "0/1",
      },
      {
        name: "leadState",
        in: "query",
        example:
          "reg_requested , pending, registered, rejected, close, doc_invalid, follow_up",
      },
      {
        name: "generalInsuranceExamStatus",
        in: "query",
        example:
          "exam_pending, exam_cleared ,exam_failed, study_link_pending, training_in_progress ,training_not_initiated",
      },
      {
        name: "lifeInsuranceExamStatus",
        in: "query",
        example:
          "exam_pending, exam_cleared ,exam_failed, study_link_pending, training_in_progress ,training_not_initiated",
      },
      {
        name: "filterInput",
        in: "query",
        description: "Accepted values are name/id/mobile/email",
      },
      {
        name: "path",
        in: "query",
        description: "comma-separated IAM UUIDs",
      },
      {
        name: "utmSource",
        in: "query",
        example: "AgentApp",
      },
      {
        name: "salesUserIamId",
        in: "query",
        description: "IAM UUID of Sales user in Filter",
      },
      {
        name: "searchAfter",
        in: "query",
        description: "Number of results to be skipped",
      },
      {
        name: "limit",
        in: "query",
        description: "Number of results to show on screen",
      },
    ],
  })
  async getLeads(@Req() request: ReqWithUser, @Res() response: Response) {
    const userInfo = request.userInfo;
    if (userInfo) {
      if (userInfo.pos_role_id === PosRoles.SubAgent) {
        throw new HttpException("user not authorized", HttpStatus.UNAUTHORIZED);
      }
      if (userInfo.pos_role_id === 1 || userInfo.pos_role_id === 2) {
        request.query["getAllLeads"] = "1";
      } else {
        request.query["getAllLeads"] = "0";
        request.query["uuid"] = userInfo["uuid"];
      }
      if (
        userInfo.pos_role_id != PosRoles.Agent &&
        request.query["salesUserIamId"]
      ) {
        request.query["uuid"] = request.query["salesUserIamId"];
        request.query["getAllLeads"] = "0";
      }
    }
    if (request.query.utmSource) {
      request.query.utmSource =
        MAP_UTM_SOURCE[request.query.utmSource as string];
    }
    const data = await this.leadService.getLeadDetails(request.query);

    const decryptionOptions = {
      endpoint: process.env.DECRYPTION_SERVICE_V2_END_POINT,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.DECRYPTION_SERVICE_AUTH_TOKEN,
      },
    };
    if (data && data.data && request.query["isAggregate"] == "0") {
      const arr = data.data;
      for (const item of arr) {
        if (userInfo["uuid"] == item.lead_owner_uuid) {
          const encryptedMobile = item.mobile_encrypt;
          const encryptedEmail = item.email_encrypt;
          const encryptedData = { data: [encryptedMobile, encryptedEmail] };
          const decryptionResponse = await this.apiHelper.postData(
            decryptionOptions,
            encryptedData
          );
          if (decryptionResponse) {
            item.mobile_mask =
              decryptionResponse.data[encryptedMobile].decrypted;
            item.email_mask = decryptionResponse.data[encryptedEmail].decrypted;
          }
        }
      }
    }

    if (request.query["getAllLeads"] == "1") {
      data.user_role = "admin";
    }

    Logger.debug(`data in controller length ::${Object.keys(data).length}`);
    let message = "leads fetched successfully";
    if (request.query["isAggregate"] == "0" && data && !data.pagination.count) {
      message = "no leads list found";
    }
    const meta = {
      statusMessage: message,
      statusCode: 200,
      displayMessage: message,
    };
    return response.status(200).json({ ...data, meta });
  }

  @Post("/download/leads")
  @UserAuth()
  async downloadLeads(@Req() request: ReqWithUser, @Res() response: Response) {
    const userInfo = request.userInfo;
    const headers = {
      authorization: request.headers.authorization,
    };
    const host = request.headers["x-hostname"];
    const medium =
      host === process.env.X_FORWAREDED_POS_APP_HOST
        ? process.env.APP_MEDIUM
        : process.env.POS_MEDIUM;
    const requestSource = medium;

    const name = request.userInfo.first_name;
    const email = request.userInfo.email;
    const uuid = request.userInfo.uuid;

    const apiParams = request.body.apiParams;
    apiParams["isDownload"] = "1";
    if (userInfo) {
      if (
        userInfo.pos_role_id === PosRoles.Agent ||
        userInfo.pos_role_id === PosRoles.SubAgent
      ) {
        throw new HttpException("user not authorized", HttpStatus.UNAUTHORIZED);
      }
      if (
        userInfo.pos_role_id === 1 ||
        userInfo.pos_role_id === 2 ||
        userInfo.pos_role_id === 5
      ) {
        apiParams["getAllLeads"] = 1;
      } else {
        apiParams["getAllLeads"] = 0;
        apiParams["uuid"] = userInfo["uuid"];
      }
      if (
        userInfo.pos_role_id != PosRoles.Agent &&
        request.body["salesUserIamId"]
      ) {
        apiParams["uuid"] = request.body["salesUserIamId"];
        apiParams["getAllLeads"] = 0;
      }
    }
    const isToDateInvalid = !apiParams.to || !moment(apiParams.to).isValid();
    const isFromDateInvalid =
      !apiParams.from || !moment(apiParams.from).isValid();
    if (isToDateInvalid || isFromDateInvalid) {
      throw new BadRequestException("Invalid date format");
    }

    const data = await this.utilityService.downloadData(
      "leads",
      apiParams,
      headers,
      requestSource,
      name,
      email,
      uuid,
      "api/leads/v2/search"
    );
    const message = "leads downloaded successfully";
    const meta = {
      statusMessage: message,
      statusCode: 200,
      displayMessage: message,
    };
    return response.status(200).json({ ...data, meta });
  }

  @Post("/leads/test-clearance")
  @UserAuth(PosRoles.Admin, PosRoles.SuperAdmin)
  async handleTestClearance(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const data = await this.leadService.handleTestClearance(
      request.body,
      request.userInfo
    );
    return sendResponse(
      request,
      response,
      200,
      "pending leads data uploaded successfully",
      data
    );
  }

  @Get("/leads/v2/search")
  @LeadAuth()
  @ApiOperation({
    summary: "Return a list of leads under a particular reporting manager",
    parameters: [
      {
        name: "from",
        in: "query",
        example: "2020-01-01",
      },
      {
        name: "to",
        in: "query",
        example: "2020-01-01",
      },
      {
        name: "uuid",
        in: "query",
        description: "IAM UUID of Sales User",
      },
      {
        name: "isAggregate",
        in: "query",
        example: "0/1",
      },
      {
        name: "leadState",
        in: "query",
        example:
          "reg_requested , pending, registered, rejected, close, doc_invalid, follow_up",
      },
      {
        name: "generalInsuranceExamStatus",
        in: "query",
        example:
          "exam_pending, exam_cleared ,exam_failed, study_link_pending, training_in_progress ,training_not_initiated",
      },
      {
        name: "lifeInsuranceExamStatus",
        in: "query",
        example:
          "exam_pending, exam_cleared ,exam_failed, study_link_pending, training_in_progress ,training_not_initiated",
      },
      {
        name: "filterInput",
        in: "query",
        description: "Accepted values are name/id/mobile/email",
      },
      {
        name: "path",
        in: "query",
        description: "comma-separated IAM UUIDs",
      },
      {
        name: "utmSource",
        in: "query",
        example: "AgentApp",
      },
      {
        name: "salesUserIamId",
        in: "query",
        description: "IAM UUID of Sales user in Filter",
      },
      {
        name: "searchAfter",
        in: "query",
        description: "Number of results to be skipped",
      },
      {
        name: "limit",
        in: "query",
        description: "Number of results to show on screen",
      },
    ],
  })
  async getLeadsInLos(@Req() request: ReqWithUser, @Res() response: Response) {
    const userInfo = request.userInfo;
    if (userInfo) {
      const agentDetails = userInfo?.agentDetails;
      if (agentDetails.role_id === PosRoles.SubAgent) {
        throw new HttpException("user not authorized", HttpStatus.UNAUTHORIZED);
      }
      if (
        agentDetails.role_id === 1 ||
        agentDetails.role_id === 2 ||
        agentDetails.role_id === 5
      ) {
        request.query["getAllLeads"] = "1";
      } else {
        request.query["getAllLeads"] = "0";
        request.query["uuid"] = userInfo["uuid"];
      }
      if (
        agentDetails.role_id != PosRoles.Agent &&
        request.query["salesUserIamId"]
      ) {
        request.query["uuid"] = request.query["salesUserIamId"];
        request.query["getAllLeads"] = "0";
      }
    }
    if (request.query.utmSource) {
      request.query.utmSource =
        MAP_UTM_SOURCE[request.query.utmSource as string];
    }
    const { dateFilterField } = request.query;
    request.query.dateFilterField = SEARCH_FIELD[dateFilterField as string];
    if (!request.query.dateFilterField) {
      request.query.dateFilterField = SEARCH_FIELD.createdAt;
    }
    const data = await this.leadService.searchLeads(request.query);

    const decryptionOptions = {
      endpoint: process.env.DECRYPTION_SERVICE_V2_END_POINT,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.DECRYPTION_SERVICE_AUTH_TOKEN,
      },
    };
    if (data?.data?.data && request.query["isAggregate"] == "0") {
      const arr = data.data.data;
      for (const item of arr) {
        if (userInfo["uuid"] == item.lead_owner_uuid) {
          const encryptedMobile = item.mobile_encrypt;
          const encryptedEmail = item.email_encrypt;
          const data = [];
          if (encryptedEmail) {
            data.push(encryptedEmail);
          }
          if (encryptedMobile) {
            data.push(encryptedMobile);
          }
          if (data.length > 0) {
            const encryptedData = { data: data };
            const decryptionResponse = await this.apiHelper.postData(
              decryptionOptions,
              encryptedData
            );
            if (decryptionResponse) {
              if (encryptedMobile) {
                item.mobile_mask =
                  decryptionResponse["data"][encryptedMobile].decrypted;
              }
              if (encryptedEmail) {
                item.email_mask =
                  decryptionResponse["data"][encryptedEmail].decrypted;
              }
            }
          }
        }
      }
    }
    Logger.debug(`data in controller length ::${Object.keys(data).length}`);
    if (!Object.keys(data).length) {
      return sendResponse(request, response, 204, "no leads list found", data);
    }
    if (request.query["getAllLeads"] == "1") {
      data.data["user_role"] = "admin";
    }
    return sendResponse(
      request,
      response,
      200,
      "leads list fetched successfully",
      data.data
    );
  }

  @Post("/doc-status/:leadId")
  @UserAuth()
  async getLeadPermissions(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const uuid = request.params.leadId;
    Logger.debug("updating lead docs status ", {
      ...request.userInfo,
    });
    const docRequestArr = request.body.docs;
    const userInfo = request.userInfo;
    if (userInfo) {
      if (
        userInfo.pos_role_id === 1 ||
        userInfo.pos_role_id === 2 ||
        userInfo.pos_role_id === 5
      ) {
        const requestBodyArr = [];
        docRequestArr.forEach((doc) => {
          const docRequest = {
            documentType: doc.doc_name,
            status: "REJECTED",
          };
          requestBodyArr.push(docRequest);
        });
        const updateDocumentResponse = await Promise.all(
          docRequestArr.map(async (document) => {
            return await this.losService.updateDocument(uuid, document);
          })
        );
        return sendResponse(
          request,
          response,
          200,
          "leads doc status updated successfully",
          updateDocumentResponse
        );
      }
    }
  }

  @Post("/v1/convert-lead-to-user")
  @UserAuth(PosRoles.SuperAdmin, PosRoles.Admin)
  public async leadCreateByFile(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    request.body.type = "userCreate";
    const redirectToUtility = await this.leadService.handleBulkUpload(
      request.body,
      request.userInfo
    );
    return sendResponse(
      request,
      response,
      redirectToUtility.status,
      redirectToUtility.message,
      redirectToUtility.data
    );
  }

  @Post("/v1/lead-reject-bulk")
  @UserAuth(PosRoles.SuperAdmin, PosRoles.Admin)
  public async leadRejectByFile(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    request.body.type = "leadReject";
    const redirectToUtility = await this.leadService.handleBulkUpload(
      request.body,
      request.userInfo
    );
    return sendResponse(
      request,
      response,
      redirectToUtility.status,
      redirectToUtility.message,
      redirectToUtility.data
    );
  }
}

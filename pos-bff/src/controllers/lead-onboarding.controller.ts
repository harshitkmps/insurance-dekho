import {
  Get,
  Controller,
  Post,
  Put,
  Req,
  Res,
  HttpException,
  Query,
} from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { TenantConfig } from "../constants/tenant.constants";
import LosService from "../services/los-service";
import LeadOnboardingService from "../services/leadonboarding-service";
import { sendResponse } from "../services/helpers/response-handler";
import { Request, Response } from "express";

import MasterAPIService from "../services/master-service";
import RmFlowLeadOnboardingService from "../services/rm-flow-lead-onboarding-service";
import CommonUtils from "../utils/common-utils";
import IamService from "../services/iam-service";

import DealerService from "../services/dealer-service";
import { Roles } from "../constants/roles.constants";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { LeadAuth } from "../decorators/lead-auth.decorator";
import ContextHelper from "../services/helpers/context-helper";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import CpsService from "../services/cps-service";
import { LeadDataVisibilityAuth } from "../decorators/lead-data-access-auth.decorator";
import { FetchLeadDetailsQueryDto } from "../dtos/onboarding/fetchLeadDetailsQuery.dto";
const posSalesRoleIdList = Roles.POS_SALES_ALL;

@Controller()
@ApiTags("Lead Onboarding")
export class LeadOnboardingController {
  constructor(
    private losService: LosService,
    private masterApiService: MasterAPIService,
    private leadOnboardingService: LeadOnboardingService,
    private rmFlowLeadOnboardingService: RmFlowLeadOnboardingService,
    private iamService: IamService,
    private dealerService: DealerService,
    private cpsService: CpsService
  ) {}

  @Post("/v1/leads")
  @LeadAuth()
  public async createLead(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    Logger.debug("creating lead for request ", request.body);
    const body = request.body;
    const userInfo = request.userInfo;
    if (
      request.headers["origin"] == process.env.X_FORWAREDED_POS_HOST ||
      request.headers["x-hostname"] == process.env.X_FORWAREDED_POS_HOST
    ) {
      body.leadOrigin = process.env.POS_MEDIUM;
    } else {
      body.leadOrigin = "POS_APP"; //process.env.APP_MEDIUM;
    }
    if (
      userInfo?.agentDetails?.role_id === 1 ||
      userInfo?.agentDetails?.role_id === 2
    ) {
      body.salesUserAssignId = userInfo.uuid;
      body.leadOriginMethods = "ADMIN";
      body.referAuthId = body.refAuthId;
      body.tenantId = body.tenantId || 1;
    } else if (userInfo?.agentDetails?.role_id === 5) {
      body.tenantId = 1;
      body.salesUserAssignId = userInfo.uuid;
      body.leadOriginMethods = "ADMIN";
    } else if (userInfo?.agentDetails?.role_id === 3) {
      body.salesUserAssignId = userInfo.uuid;
      body.referrerUserId = userInfo.uuid;
      body.salesUserAssignId = userInfo.uuid;
      body.tenantId = userInfo.tenantId || 1;
      body.referAuthId = body.refAuthId;
      body.leadOriginMethods = "DEALER";
    } else if (posSalesRoleIdList.includes(userInfo?.agentDetails?.role_id)) {
      body.salesUserAssignId = userInfo.uuid;
      body.leadOriginMethods = "SALES";
      body.tenantId = 1;
    } else {
      body.mobile = userInfo.mobile;
      body.uuid = userInfo.uuid;
      body.tenantId = userInfo.tenantId || 1;
      body.leadOriginMethods = "SELF";
      if (userInfo?.tenantId != 1) {
        Logger.debug(`setting referrer id for self lead ${body.uuid}`);
        const tenantConfig = await TenantConfig(userInfo.tenantId);
        body.referrerUserId = tenantConfig.uuid;
      }
    }
    Logger.log(`request body for create lead ${JSON.stringify(body)}`);
    const leadResponse: any = await this.leadOnboardingService.createLead(body);
    return sendResponse(
      request,
      response,
      200,
      "lead created successfully",
      leadResponse
    );
  }

  @Put("/v1/leads")
  @LeadAuth()
  public async updateLead(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const leadId = ContextHelper.getStore().get("leadId");
    const userInfo = request.userInfo;
    Logger.log(
      `updating lead for leadId: ${leadId}  requested by user :${userInfo?.uuid}`
    );
    const leadupdateResponse = await this.leadOnboardingService.updateLead(
      leadId,
      request?.body
    );
    return sendResponse(
      request,
      response,
      200,
      "lead updated successfully",
      leadupdateResponse
    );
  }

  @Post("/v1/assignlead")
  @LeadAuth()
  public async assignLeadToSalesUser(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const userInfo = request.userInfo;
    if (
      !userInfo ||
      !userInfo.agentDetails ||
      ![1, 2, 3].includes(userInfo.agentDetails.role_id)
    ) {
      throw new HttpException("user not authorized to assign lead", 401);
    }
    const body = request.body;
    const uuid = body.leadId;
    const leadUpdateResponse = await this.leadOnboardingService.updateLead(
      uuid,
      body
    );
    return sendResponse(
      request,
      response,
      200,
      "lead updated successfully",
      leadUpdateResponse
    );
  }

  @Get("/v1/leads/details")
  @LeadAuth()
  public async fetchLeadDetailsForSelfOnboarding(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const userInfo = request.userInfo;
    const uuid = userInfo.uuid;
    const leadData =
      await this.leadOnboardingService.fetchLeadDetailsForSelfOnboarding(uuid, {
        headers: request.headers,
      });
    leadData.isExistingAgent = userInfo.isExistingAgent;
    leadData.agentDetails = userInfo.agentDetails;
    return sendResponse(
      request,
      response,
      200,
      "lead details fetched",
      leadData
    );
  }

  @Get("/v2/leads/details")
  @LeadDataVisibilityAuth()
  @LeadAuth()
  @ApiOperation({
    summary: "Get Lead details for Self onboarding",
  })
  public async fetchLeadDetailsForSelfOnboardingV2(
    @Req() request: ReqWithUser,
    @Res() response: Response,
    @Query() query: FetchLeadDetailsQueryDto
  ) {
    const context = ContextHelper.getStore();
    const userInfo = request?.userInfo;
    const leadInfo = context.get("leadInfo");
    const fetchLight = query.fetchLight;
    let leadRawData = userInfo;
    if (userInfo.accountType === "user") {
      leadRawData = leadInfo;
    }
    const headers = { headers: request?.headers, userInfo };
    let structuredLeadData = leadRawData;
    if (!fetchLight && userInfo.accountType) {
      structuredLeadData =
        await this.leadOnboardingService.parseLeadDetailResponse(
          leadRawData,
          headers
        );
    }
    const leadData = {
      ...structuredLeadData,
      isExistingAgent: userInfo?.isExistingAgent,
      agentDetails: userInfo?.agentDetails,
    };
    return sendResponse(
      request,
      response,
      200,
      "lead details fetched",
      leadData
    );
  }

  @Get("/v1/leads/training/details")
  @LeadAuth()
  @ApiOperation({
    summary: "Get training configuration for the lead/agent",
  })
  public async getTrainingConfiguration(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const userInfo = request.userInfo;
    const leadId = userInfo.uuid;
    const insuranceTypeString = (
      request.query.insuranceType ? request.query.insuranceType : "1"
    ) as string;
    const insuranceTypes = insuranceTypeString.split(",");
    const trainingData =
      await this.leadOnboardingService.getTrainingConfiguration(
        leadId,
        insuranceTypes
      );
    return sendResponse(
      request,
      response,
      200,
      "training data fetched successfully",
      { trainingData }
    );
  }

  @Put("/v1/leads/document/pan")
  @LeadAuth()
  public async updatePanDocumentAndName(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const leadId = ContextHelper.getStore().get("leadId");
    const userInfo = request.userInfo;
    Logger.log(
      ` updating document-pan for leadId: ${leadId}  requested by user :${userInfo?.uuid}`
    );
    const body = request.body;
    await this.leadOnboardingService.updatePanAndName(leadId, body);
    const isMovedToQC = await this.leadOnboardingService.sendForRegistration(
      leadId
    );
    const responseBody = {
      isMovedToQC,
    };
    return sendResponse(
      request,
      response,
      200,
      "pan details updated successfully",
      responseBody
    );
  }

  @Put("/v1/leads/document/noc")
  @LeadAuth()
  public async updateNocDocument(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const leadId = ContextHelper.getStore().get("leadId");
    const userInfo = request.userInfo;
    Logger.log(
      ` updating document-noc for leadId: ${leadId}  requested by user :${userInfo?.uuid}`
    );
    const body = request.body;
    await this.leadOnboardingService.updateNoc(leadId, body);
    const isMovedToQC = await this.leadOnboardingService.sendForRegistration(
      leadId
    );
    const responseBody = {
      isMovedToQC,
    };
    return sendResponse(
      request,
      response,
      200,
      "noc details updated successfully",
      responseBody
    );
  }

  @Put("/v1/leads/document/aadhaar")
  @LeadAuth()
  public async updateAadharDetails(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const leadId = ContextHelper.getStore().get("leadId");
    const userInfo = request.userInfo;
    Logger.log(
      ` updating document-aadhaar for leadId: ${leadId}  requested by user :${userInfo?.uuid}`
    );
    await this.leadOnboardingService.updateAadhaarDetails(
      leadId,
      request?.body
    );
    const isMovedToQC = await this.leadOnboardingService.sendForRegistration(
      leadId
    );
    const responseBody = {
      isMovedToQC,
    };
    return sendResponse(
      request,
      response,
      200,
      "aadhar details updated successfully",
      responseBody
    );
  }

  @Put("/v1/create-irda-user")
  public async updateAndCreateLead(
    @Req() request: Request,
    @Res() response: Response
  ) {
    const { message, data } =
      await this.leadOnboardingService.updateAndCreateLead(request.body);
    return sendResponse(request, response, 200, message, data);
  }

  @Put("/v1/lead-reject")
  public async leadReject(@Req() request: Request, @Res() response: Response) {
    const { message, data } = await this.leadOnboardingService.leadReject(
      request.body
    );
    return sendResponse(request, response, 200, message, data);
  }

  @Put("/v1/leads/document/photo")
  @LeadAuth()
  public async updatePhoto(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    try {
      const body = request.body;
      const leadId = ContextHelper.getStore().get("leadId");
      const userInfo = request.userInfo;
      Logger.log(
        ` updating document-photo for leadId: ${leadId}  requested by user :${userInfo?.uuid}`
      );
      await this.leadOnboardingService.updatePhoto(leadId, body);
      const isMovedToQC = await this.leadOnboardingService.sendForRegistration(
        leadId
      );
      const responseBody = {
        isMovedToQC,
      };
      return sendResponse(
        request,
        response,
        200,
        "lead photo updated successfully",
        responseBody
      );
    } catch (error) {
      Logger.error(
        `error in updating lead photo error: ${JSON.stringify(error)}`
      );
      throw new HttpException("some error occured", 500);
    }
  }

  @Put("/v1/leads/education")
  @LeadAuth()
  public async updateEducationDetails(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const body = request.body;
    const leadId = ContextHelper.getStore().get("leadId");
    const userInfo = request.userInfo;
    Logger.log(
      ` updating education for leadId: ${leadId}  requested by user :${userInfo?.uuid}`
    );
    await this.leadOnboardingService.updateEducationDetails(leadId, body);
    const isMovedToQC = await this.leadOnboardingService.sendForRegistration(
      leadId
    );
    const responseBody = {
      isMovedToQC,
    };
    return sendResponse(
      request,
      response,
      200,
      "lead education details updated successfully",
      responseBody
    );
  }

  @Put("/v1/leads/bank")
  @LeadAuth()
  public async updateBankDetails(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const leadId = ContextHelper.getStore().get("leadId");
    const userInfo = request.userInfo;
    Logger.log(
      ` updating bank for leadId: ${leadId}  requested by user :${userInfo?.uuid}`
    );
    const data = await this.leadOnboardingService.updateBankDetails(
      leadId,
      request.body
    );
    /*const isMovedToQC = await this.leadOnboardingService.sendForRegistration(uuid);
    data.isMovedToQC = isMovedToQC;*/
    CommonUtils.renameKey(data, "movedToQC", "isMovedToQC");
    return sendResponse(
      request,
      response,
      200,
      "lead bank details updated successfully",
      data
    );
  }

  @Put("/v1/leads/work")
  @LeadAuth()
  public async updateWorkDetails(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const body = request.body;
    const leadId = ContextHelper.getStore().get("leadId");
    const userInfo = request.userInfo;
    Logger.log(
      ` updating work for leadId: ${leadId}  requested by user :${userInfo?.uuid}`
    );
    const responseData = await this.leadOnboardingService.updateWorkDetails(
      leadId,
      body
    );
    //const isMovedToQC = await this.leadOnboardingService.sendForRegistration(uuid);
    CommonUtils.renameKey(responseData, "movedToQC", "isMovedToQC");
    return sendResponse(
      request,
      response,
      200,
      "lead work details updated successfully",
      responseData
    );
  }

  @Post("/leads/ckyc")
  @LeadAuth()
  @ApiOperation({
    summary: "Initiate ckyc for the lead against PAN and DOB",
    description: "Initiate ckyc for the lead against PAN and DOB",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              pan: "string",
              dateOfBirth: "dd-mm-yyyy",
              additionalDetails: {
                isPoliticallyExposed: 1,
              },
              leadId: "string",
            },
          },
        },
      },
    },
  })
  public async fetchCKYC(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    if (request.body.dateOfBirth != null) {
      request.body.dateOfBirth = request.body.dateOfBirth
        .split("T")[0]
        .split("-")
        .reverse()
        .join("-");
    }
    const leadId = ContextHelper.getStore().get("leadId");
    const userInfo = request.userInfo;
    Logger.log(
      ` updating leads-ckyc for leadId: ${leadId}  requested by user :${userInfo?.uuid}`
    );
    const kycData = await this.leadOnboardingService.fetchCkycDetails(leadId, {
      body: request.body,
      headers: request.headers,
    });
    const isMovedToQC = await this.leadOnboardingService.sendForRegistration(
      leadId
    );
    kycData.isMovedToQC = isMovedToQC;
    return sendResponse(
      request,
      response,
      200,
      "lead ckyc details fetched successfully",
      kycData
    );
  }

  @Post("/leads/noc-validate")
  @LeadAuth()
  public async checkForNoc(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const leadId = ContextHelper.getStore().get("leadId");
    const userInfo = request.userInfo;
    Logger.log(
      `validating noc for leadId: ${leadId}  requested by user :${userInfo?.uuid}`
    );
    const nocResponse = await this.losService.checkIsNocRequired(
      leadId,
      request.body
    );
    nocResponse.leadId = leadId;
    return sendResponse(
      request,
      response,
      200,
      "lead noc details fetched successfully",
      nocResponse
    );
  }

  @Get("/v1/lead-details/:leadId")
  @LeadAuth()
  public async getLeadCompleteDetails(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const uuid = request.params.leadId;
    const [leadDetails, tenantList] = await Promise.all([
      this.losService.fetchLeadDetails(uuid, {}),
      this.masterApiService.getTenantDetails(),
    ]);
    const parsedResponse =
      await this.rmFlowLeadOnboardingService.transformGetDetails(
        request,
        leadDetails
      );
    const tenantInfo = tenantList.tenant.find(
      (tenantInfo: any) =>
        tenantInfo.id === parsedResponse.basicDetails.tenantId
    );
    if (tenantInfo.id !== 1 && tenantInfo.login_mode === "SSO") {
      const iamUserDetails = await this.iamService.getDetailsByUuid(uuid, {});
      parsedResponse.basicDetails.isRefAuthIdReq = true;
      parsedResponse.basicDetails.referenceAuthId =
        iamUserDetails.referenceAuthId;
    }

    return sendResponse(
      request,
      response,
      200,
      "lead details fetched",
      parsedResponse
    );
  }

  @Post("/v1/lead-details/:leadId")
  @LeadAuth()
  public async updateLeadBasicDetails(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    if (request.body.date_of_birth != null) {
      request.body.dateOfBirth = request.body.date_of_birth.split("T")[0];
    }
    const uuid = request.params.leadId;
    const leadUpdateResponse = await this.losService.updateLeadBasicDetails(
      request.body,
      uuid
    );
    return sendResponse(
      request,
      response,
      200,
      "lead details updated successfully",
      leadUpdateResponse
    );
  }

  @Get("/v1/training/download")
  @LeadAuth()
  public async getTrainingMaterialLink(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    let insuranceType = request.query.insuranceType
      ? parseInt(request.query.insuranceType as string)
      : 1;
    const userInfo = request.userInfo;
    let uuid = userInfo.uuid;
    if (
      userInfo?.agentDetails?.role_id === 1 ||
      userInfo?.agentDetails?.role_id === 2 ||
      userInfo?.agentDetails?.role_id === 5
    ) {
      uuid = request.query.leadId;
      insuranceType = insuranceType != null ? insuranceType : 1;
    }
    const downloadLink =
      await this.leadOnboardingService.getTrainingMaterialLink(
        uuid,
        insuranceType
      );
    return sendResponse(
      request,
      response,
      200,
      "lead training status updated successfully",
      { link: downloadLink }
    );
  }

  @Get("/v1/training/starttest")
  @LeadAuth()
  public async startTestAndFetchQuestions(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const userInfo = request.userInfo;
    let leadId = userInfo.uuid;
    if (
      userInfo?.agentDetails?.role_id === 1 ||
      userInfo?.agentDetails?.role_id === 2
    ) {
      leadId = request.query.leadId;
    }
    let insuranceType = (
      request.query.insuranceType
        ? request.query.insuranceType
        : request.query.insurance_type
    ) as string;
    if (insuranceType == null) {
      insuranceType = "1";
    }
    const questions = await this.leadOnboardingService.startTest(
      leadId,
      insuranceType
    );
    return sendResponse(
      request,
      response,
      200,
      "questions fetched successfully",
      { questions }
    );
  }

  @Post("/v1/cps/map")
  public async mapChannelPartner(@Req() request: any, @Res() response: any) {
    const params = request.body.params;
    const rparams = params.map((param) => ({
      dealer_gcd_code: param.gcd_code,
      team_name: "Motor & Health 1",
      reporting_sfa_id: 3830,
    }));
    Logger.debug(`mapping cps parasm `, rparams);
    const res = await this.cpsService.cpsMapToRapTeam(rparams);
    return sendResponse(
      request,
      response,
      200,
      "mapping cps to rap successfully",
      res
    );
  }

  @Post("/v1/training/clear-test")
  public async clearTest(@Req() request: Request, @Res() response: Response) {
    const body = request.body;
    const insuranceType = body.insuranceType ? body.insuranceType : 1;
    const params = body.params[0];
    Logger.debug(`Attempting test for the leadId:  ${params.leadId}`);
    const data = await this.leadOnboardingService.clearTest(
      params,
      insuranceType
    );
    return sendResponse(
      request,
      response,
      200,
      "test cleared successfully",
      data
    );
  }

  @Post("/v1/training/submittest")
  @LeadAuth()
  public async submitTest(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    try {
      const body = request.body;
      const insuranceType = body.insuranceType ? body.insuranceType : 1;
      const userInfo = request.userInfo;
      let uuid = userInfo.uuid;
      if (
        userInfo?.agentDetails?.role_id === 1 ||
        userInfo?.agentDetails?.role_id === 2 ||
        userInfo?.agentDetails?.role_id === 5
      ) {
        uuid = request.body.leadId;
      }
      const data = await this.leadOnboardingService.submitTest(
        uuid,
        insuranceType,
        body.answerObject
      );
      return sendResponse(
        request,
        response,
        200,
        "test submitted successfully",
        data
      );
    } catch (error) {
      Logger.error(`error in submitTest error: ${JSON.stringify(error)}`);
      throw new HttpException("some error occured", 500);
    }
  }

  @Put("/v1/leads/document/:leadId")
  @LeadAuth()
  public async updateDocument(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const docRequestArr = request?.body?.docs;
    const uuid = request.params.leadId;
    const status = request?.body?.status;
    Logger.debug(`updating lead documents for leadId ${uuid}`, docRequestArr);
    for (const doc of docRequestArr) {
      const docRequest = {
        documentId: doc.documentId,
        documentType: doc.documentType,
        documentSource: "MANUAL",
      };
      if (status === "REJECTED") {
        docRequest["remarkId"] = doc.remarkId;
        docRequest["status"] = "REJECTED";
      }
      await this.losService.updateDocument(uuid, doc);
    }
    return sendResponse(
      request,
      response,
      200,
      "document details updated successfully",
      {}
    );
  }

  @Post("/v1/lead-event")
  @LeadAuth()
  public async triggerLeadEvent(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const triggerResponse = await this.losService.triggerLeadEvent(
      request.body
    );
    return sendResponse(
      request,
      response,
      200,
      "lead event triggered",
      triggerResponse
    );
  }

  @Post("/v1/leads/followup")
  @LeadAuth()
  public async updateLeadFollowUp(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    try {
      Logger.debug(`updating lead follow up for leadId ${request.body.leadId}`);
      const body = request.body;
      const followUpRequestBody = {
        followupBy: request.userInfo?.uuid,
        remarks: body?.follow_up_text,
        followupAt: new Date(body?.follow_up_time),
        leadId: body?.leadId,
      };
      const followUpResponse = await this.losService.updateLeadFollowUp(
        followUpRequestBody
      );
      return sendResponse(
        request,
        response,
        200,
        "lead followup updated successfully",
        followUpResponse.data
      );
    } catch (error) {
      Logger.error(`error in updating lead error: ${JSON.stringify(error)}`);
      throw new HttpException("some error occured", 500);
    }
  }

  @Post("/v1/leads/share-test-link")
  @LeadAuth()
  public async shareTestLink(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    Logger.debug(`sharing test link for leadId ${request.body.leadId}`);
    const body = request.body;
    const insuranceType = body.gi_insurance ? 1 : 2;
    const url =
      process.env.POS_APP_URL +
      `/channel/new-test/${request.body.leadId}?insuranceType=${insuranceType}`;
    if (body.gi_insurance) {
      const requestBodyForGeneralTestLink = {
        insuranceType: "GENERAL",
        status: "TEST_LINK_SHARED",
      };
      await this.losService.updateTrainingStatus(
        body.leadId,
        requestBodyForGeneralTestLink
      );
    }
    if (body.non_gi_insurance || !body.gi_insurance) {
      const requestBodyForLifeTestLink = {
        insuranceType: "LIFE",
        status: "TEST_LINK_SHARED",
      };
      await this.losService.updateTrainingStatus(
        body.leadId,
        requestBodyForLifeTestLink
      );
    }
    return sendResponse(
      request,
      response,
      200,
      "lead training material shared successfully successfully",
      { token: url }
    );
  }

  @Post("/v1/leads/shareTrainingMaterial")
  @LeadAuth()
  public async shareTrainingMaterial(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const body = request.body;
    // eslint-disable-next-line prefer-const
    let { leadId, insuranceTypes } = body;
    if (insuranceTypes == null) {
      insuranceTypes = [1, 2];
    }
    await this.leadOnboardingService.shareTrainingMaterials(
      leadId,
      insuranceTypes
    );
    return sendResponse(
      request,
      response,
      200,
      "Training material shared successfully",
      null
    );
  }

  @Post("/v1/leads/verifyBankAccount")
  @LeadAuth()
  public async verifyBankAccount(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const body = request.body;
    const userDetails = await this.dealerService.getDealerDetails({
      iam_uuid: body.uuid,
    });
    const payload = {
      beneficiaryAccountNumber: body.accountNumber,
      beneficiaryIFSC: body.ifsc,
      beneficiaryName: userDetails[0]?.name,
      beneficiaryMobile: userDetails[0]?.mobile,
      beneficiaryEmail: userDetails[0]?.email,
      beneficiaryAddress: userDetails[0]?.address,
      uuid: body.uuid,
    };
    const resp = await this.losService.verifyBankDetails(payload);
    return sendResponse(
      request,
      response,
      200,
      "Bank account details from Bank",
      resp
    );
  }

  @Get("/leads/kyc/digilocker")
  @LeadAuth()
  public async fetchDigilockerKYC(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const kycData = await this.leadOnboardingService.fetchKycDetails(request);
    Logger.debug("KycData from digilocker", kycData);
    return sendResponse(
      request,
      response,
      200,
      "lead kyc details fetched successfully",
      kycData
    );
  }

  @Get("/leads/kyc/digilocker/auth")
  @LeadAuth()
  public async redirectToDigilocker(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    const source = request.query.source;
    const pkce = await this.leadOnboardingService.getPkce(
      request.userInfo?.uuid
    );
    const codeChallengeSuffix = `&code_challenge=${pkce?.code_challenge}&code_challenge_method=S256`;
    if (source === "POSAPP") {
      return response.redirect(
        `https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize?client_id=${process.env.DIGILOCKER_APP_CLIENT_ID}&response_type=${process.env.DIGILOCKER_RESPONSE_TYPE}&redirect_uri=${process.env.DIGILOCKER_APP_REDIRECT_URI}&state=${request.query.step}${source}${codeChallengeSuffix}`
      );
    }
    return response.redirect(
      `https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize?client_id=${process.env.DIGILOCKER_CLIENT_ID}&response_type=${process.env.DIGILOCKER_RESPONSE_TYPE}&redirect_uri=${process.env.DIGILOCKER_REDIRECT_URI}&state=${request.query.step}${source}${codeChallengeSuffix}`
    );
  }

  @Get("/v1/remarks")
  public async fetchRejectionRemarks(
    @Req() request: any,
    @Res() response: any
  ) {
    const category_type = request?.query?.category;
    if (category_type) {
      const leadData = await this.leadOnboardingService.fetchRejectionRemarks(
        category_type
      );
      return sendResponse(
        request,
        response,
        200,
        "Rejection Remarks has been fetched successfully",
        leadData
      );
    } else {
      return sendResponse(
        request,
        response,
        400,
        "Rejection remarks hasn't been fecthed successfully",
        []
      );
    }
  }

  @Put("/v1/leads/re-register")
  @UserAuth(...Roles.POS_ADMIN_ALL, ...Roles.POS_SALES_ALL, Roles.POS_AGENT)
  public async reRegisterLead(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const roleId = request.userInfo?.pos_role_id;
    const leadId =
      roleId === Roles.POS_AGENT ? request.userInfo.uuid : request.body.leadId;
    Logger.log(`Re-Registering user to lead with uuid ${leadId} `);
    const migrationResponse = await this.leadOnboardingService.migrateLead(
      leadId
    );
    return sendResponse(request, response, 200, "success", migrationResponse);
  }

  @Post("/v1/leads/aadhaar/send-otp")
  @LeadAuth()
  @ApiOperation({
    summary: "Send OTP to the aadhaar ",
    description: "Send OTP to the aadhaar",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              aadhaarNumber: "123412341234",
            },
          },
        },
      },
    },
  })
  public async sendAadhaarOtp(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    Logger.log(`Requesting otp for aadhaar `);
    const otpResponse = await this.losService.sendAadhaarOtp(request.body);
    return sendResponse(
      request,
      response,
      200,
      "OTP sent successfully",
      otpResponse
    );
  }

  @Post("/v1/leads/aadhaar/submit-otp")
  @LeadAuth()
  @ApiOperation({
    summary: "Submit OTP against the aadhaar ref id ",
    description: "Submit OTP against the aadhaar ref id",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              requestId: "string",
              otp: "123456",
              leadId: "string",
            },
          },
        },
      },
    },
  })
  public async submitAadhaarOtp(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const leadId = ContextHelper.getStore().get("leadId");
    const userInfo = request.userInfo;
    Logger.log(
      `fetching leads-aadhaar details for leadId: ${leadId}  requested by user :${userInfo?.uuid}`
    );
    const kycData = await this.leadOnboardingService.submitAadhaarOtp(
      leadId,
      request.body
    );
    const isMovedToQC = await this.leadOnboardingService.sendForRegistration(
      leadId
    );
    kycData.isMovedToQC = isMovedToQC;
    return sendResponse(
      request,
      response,
      200,
      "lead aadhaar details fetched successfully",
      kycData
    );
  }

  @Post("/v2/leads/ckyc")
  @LeadAuth()
  @ApiOperation({
    summary: "Initiate ckyc for the lead against PAN and DOB",
    description: "Initiate ckyc for the lead against PAN and DOB",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              pan: "string",
              dateOfBirth: "dd-mm-yyyy",
              additionalDetails: {
                isPoliticallyExposed: 1,
              },
              leadId: "string",
            },
          },
        },
      },
    },
  })
  public async fetchCKYCv2(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    if (request?.body?.dateOfBirth) {
      request.body.dateOfBirth = request.body.dateOfBirth
        .split("T")[0]
        .split("-")
        .reverse()
        .join("-");
    }
    const leadId = ContextHelper.getStore().get("leadId");
    const userInfo = request.userInfo;
    Logger.log(
      `updating leads-ckyc V2 for leadId: ${leadId}  requested by user :${userInfo?.uuid}`
    );
    const kycData = await this.leadOnboardingService.fetchCkycDetailsV2(
      leadId,
      request.body
    );
    kycData.isMovedToQC = false;
    return sendResponse(
      request,
      response,
      200,
      "lead ckyc details fetched successfully",
      kycData
    );
  }
}

import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  Logger,
  Body,
  HttpStatus,
} from "@nestjs/common";
import { sendResponse } from "../services/helpers/response-handler";
import MotorOnlineService from "../services/motor-online-service";
import SupportService from "../services/support-service";
import { LeadMiddlewareService } from "../core/api-helpers/lead-middleware.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import MotorProposalService from "../services/motor-proposal.service";
import CommonUtils from "../utils/common-utils";
import MasterAPIService from "../services/master-service";
import BrokerageAPIService from "../services/api-brokerage-service";
import ItmsService from "../core/api-helpers/itms-service";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import CommonApiHelper from "../services/helpers/common-api-helper";
import { Request, Response } from "express";
import { GetQuoteBasedOnCustomerDto } from "../dtos/motor-online/getQuoteBasedOnCustomer.dto";
import { DealerHierarchyAuth } from "../decorators/dealer-hierarchy-auth.decorator";
import { createMotorLeadRequestDto } from "../dtos/create-lead-request.dto";

@Controller("/v1/motor-online")
@ApiTags("Motor Online")
export class MotorOnlineController {
  private authMiddleware: AuthMiddleware;

  constructor(
    private motorOnlineService: MotorOnlineService,
    private supportService: SupportService,
    private leadMiddlewareService: LeadMiddlewareService,
    private motorProposalService: MotorProposalService,
    private masterApiService: MasterAPIService,
    private brokerageAPIService: BrokerageAPIService,
    private itmsService: ItmsService,
    private apiHelper: CommonApiHelper
  ) {
    this.authMiddleware = new AuthMiddleware(this.apiHelper);
  }

  @Get("/leads")
  @ApiOperation({
    summary: "get Lead Data From LMW",
  })
  async getDataFromLM(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const query: any = req.query;
      await this.authMiddleware.use(req, res);
      const userInfo: any = req.userInfo;
      const leadId = query?.leadId;
      const leadStage = query?.stage;
      const isRenewalOfflineSummaryPage = query?.isRenewalOfflineSummaryPage;
      const isFetchZoopData = query?.isFetchZoopData;
      const medium = this.motorOnlineService.getLeadMedium(req.headers);
      const leadResponse = await this.motorOnlineService.getDataFromLM(
        medium,
        leadId,
        leadStage,
        isFetchZoopData,
        userInfo?.uuid,
        isRenewalOfflineSummaryPage
      );
      const updatedLeadDetails = leadResponse;
      // if (["quote", "paymentSummary"].includes(leadStage)) {
      // updatedLeadDetails =
      //   this.motorProposalService.maskProposalPii(leadResponse);
      // }
      this.motorProposalService.checkPolicyDocAccess(
        updatedLeadDetails,
        userInfo?.pos_role_id
      );

      this.motorProposalService.checkPypPolicyExpired(updatedLeadDetails);
      this.motorProposalService.checkValidRegistrationNumber(
        updatedLeadDetails
      );
      return sendResponse(
        req,
        res,
        200,
        "motor online lead details",
        updatedLeadDetails
      );
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }

  @Post("/quotes")
  @ApiOperation({
    summary: "Return Quotes Page Data",
    requestBody: {
      description: "returns quotes",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              leadId: "65670b1e4792151c7e86f0df",
              apiKey: "GAADI123456",
              source: "AGENCY",
              subSource: "POS",
              medium: "POS",
              mode: "ONLINE",
              policyType: "comprehensive",
              businessType: "Rollover",
              vehicleSubType: "",
              vehicleCategory: "2",
              customerType: "I",
              isRenewal: 0,
              policyNo: "",
              registrationNo: "",
              idv: 0,
              isPaidDriver: 0,
              isPACoverOwnerDriver: 0,
              rtoCode: "MH01",
              registrationDate: "2004-11-30",
              manufactureDate: "2004-11-01",
              versionId: "5453",
              userId: 98353322,
              dealerId: "101861",
              isLpgCngKit: 0,
              kitType: "",
              lpgCngKitValue: 0,
              prevInsurerId: "10",
              prevPolicyEndDate: "2023-12-09",
              isPrevPolicyClaimed: "0",
              prevNcbPercentage: "50",
              isPrevPolicyExpiredBeforeNinetyDays: 0,
              passengerCover: 0,
              electricalAccessories: 0,
              nonElectricalAccessories: 0,
              isZeroDep: 0,
              isPayUDriveDiscount: 0,
              annualDriveKm: 0,
              isRsaCover: 0,
              isInvoiceCover: 0,
              isConsumablesCover: 0,
              isEngineProtection: 0,
              isNcbProtectionCover: 0,
              isHospitalCover: 0,
              isMedicalCover: 0,
              isAmbulanceCover: 0,
              isHydrostaticLockCover: 0,
              isKeyReplacementCover: 0,
              isLossOfPersonalBelonging: 0,
              isEmergencyHotelTransport: 0,
              isTyreSecure: 0,
              isPassengerAssistCover: 0,
              isIMT23Cover: 0,
              isZeroDepInPrevPolicy: 1,
              isInvoiceCoverInPrevPolicy: 1,
              isEngineCoverInPrevPolicy: 1,
              isTyreCoverInPrevPolicy: 1,
              isKeyCoverInPrevPolicy: 1,
              isLOPBCoverInPrevPolicy: 1,
              isAntiTheftDeviceFitted: 0,
              isAaiMember: 0,
              voluntaryDeductible: "0",
              sessionId: "",
              prevPolicyType: "",
              policy_exp_before_90_days: -1,
              insurers: "",
              isShowODPolicyType: 0,
            },
          },
        },
      },
    },
  })
  async getAsyncQuotesData(@Req() req: any, @Res() res: any) {
    try {
      const { body, headers } = req; // Extract required data
      const data = await this.motorOnlineService.getAsyncQuotesData(
        body,
        headers
      ); // Pass extracted data to service
      return sendResponse(req, res, 200, "ok", data);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }

  // To be removed
  @Get("/redirect-to-new-quote-page")
  async isRedirectToNewQuotePage(@Req() req: any, @Res() res: any) {
    return sendResponse(req, res, 200, "ok", {
      isRedirectEnabled: true,
    });
  }

  @Get("/cashless-garages")
  async getCashlessGaragesList(@Req() req: any, @Res() res: any) {
    try {
      const { rto_code, vehicle_category, insurer, type } = req.query;
      const cashlessGaragesList =
        await this.motorOnlineService.getCashlessGaragesListOrCount(
          rto_code,
          vehicle_category,
          insurer,
          type
        );
      return sendResponse(req, res, 200, "ok", cashlessGaragesList);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }

  @Get("/vehicle-type-usage-list")
  async getVehicleUsageTypeList(@Req() req: any, @Res() res: any) {
    try {
      const vehicleUsageTypelist =
        await this.motorOnlineService.getVehicleUsageTypeList();
      return sendResponse(req, res, 200, "ok", vehicleUsageTypelist);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }

  @Get("/body-type-list")
  async getBodyTypeList(@Req() req: any, @Res() res: any) {
    try {
      const { categoryId } = req.query;
      const bodyTypeList = await this.motorOnlineService.getBodyTypeList(
        categoryId
      );
      return sendResponse(req, res, 200, "ok", bodyTypeList);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }

  @Get("/motor-filters")
  async getMotorFilteredList(@Req() req: any, @Res() res: any) {
    try {
      const {
        policyType,
        categoryId,
        registrationYear,
        source,
        subSource,
        businessType,
        isPrevPolicyExpiredBeforeNinetyDays,
      } = req.query;
      const motorFilteredList =
        await this.motorOnlineService.getMotorFilteredList(
          policyType,
          categoryId,
          registrationYear,
          source,
          subSource,
          businessType,
          isPrevPolicyExpiredBeforeNinetyDays
        );
      return sendResponse(req, res, 200, "ok", motorFilteredList);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }

  @Post("/share-quote")
  async addShareQuote(@Req() req: any, @Res() res: any) {
    try {
      const body = req?.body;
      const data = await this.leadMiddlewareService.addShareQuotes(body);
      return sendResponse(req, res, 200, "ok", data);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }

  @Get("/shared-quote-list")
  async getSharedQuoteList(@Req() req: any, @Res() res: any) {
    try {
      const shareQuoteId = req.query.shareQuoteId;
      const sharedQuoteList = await this.motorOnlineService.getSharedQuoteList(
        shareQuoteId
      );
      return sendResponse(req, res, 200, "ok", sharedQuoteList);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }

  @Post("/push-selected-quotes")
  @UserAuth()
  @ApiOperation({
    summary: "Push the selected quote in QMW",
  })
  async pushSelectedQuotes(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const vehicleCategory = req.query.vehicleCategory as string;
      const data = await this.motorOnlineService.pushSelectedQuotes(
        vehicleCategory,
        req.body,
        req.userInfo
      );
      return sendResponse(req, res, 200, "ok", data);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }

  @Get("/support-category-list")
  @UserAuth()
  async getSupportCategoryList(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const userInfo = req.userInfo;
      const supportData = await this.supportService.loginUserToSupport(
        userInfo.auth_token
      );
      const supportCategoryList =
        await this.motorOnlineService.getSupportCategoryList(req, supportData);

      return sendResponse(req, res, 200, "ok", supportCategoryList);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }

  @Get("/self-inspection-info")
  async getSelfInspectionInfo(@Req() req: any, @Res() res: any) {
    try {
      const selfInspectionInfo =
        await this.motorOnlineService.getSelfInspectionInfo(
          req.query.insurerId,
          req.query.vehicleType,
          req.query.policyCaseId
        );
      return sendResponse(req, res, 200, "ok", selfInspectionInfo);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }

  @Get("/case/creator")
  @UserAuth()
  async checkCaseCreator(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const userInfo = req.userInfo;
      const isCheckCaseCreator = await this.motorOnlineService.checkCaseCreator(
        req.query.partnerUuid as string,
        userInfo?.uuid
      );
      return sendResponse(req, res, 200, "ok", {
        isCheckCaseCreator,
      });
    } catch (err) {
      return sendResponse(req, res, err?.response || 500, "error", {
        err: err?.response || err,
      });
    }
  }

  @Post("/config")
  async fetchConfigForMotorProposalOnline(@Req() req: any, @Res() res: any) {
    try {
      const params = req.body;
      const config = await this.motorOnlineService.config(params);

      return sendResponse(req, res, 200, "config fetched", config);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in fetching online motor proposal config", { error });
      return res.status(err.status || 500).json(err);
    }
  }

  @UserAuth()
  @Post("/kyc")
  async updateNewKyc(@Req() req: any, @Res() res: any) {
    try {
      const response = await this.motorOnlineService.updateAlternateInsurerKyc(
        req.body
      );
      return sendResponse(req, res, 200, "kyc data updated", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error while updating kyc for this insurer", { error });
      return sendResponse(
        req,
        res,
        500,
        "Internal Server Error",
        error?.status || error
      );
    }
  }

  @UserAuth()
  @Get("/alternate-quotes")
  async getAlternateQuotes(@Req() req: any, @Res() res: any) {
    try {
      const params = req.query;

      const response = await this.motorOnlineService.getAlternateQuotes(params);
      return sendResponse(req, res, 200, "Quotes Fetched", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error while getting quotes", { error });
      return res.status(err.status || 500).json(err.message);
    }
  }

  @UserAuth()
  @Post("/leads")
  async updateLeadStatus(@Req() req: any, @Res() res: any) {
    try {
      const response = await this.motorOnlineService.updateLeadStatus(req.body);
      return sendResponse(req, res, 200, "lead updated", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error while updating lead", { error });
      return res.status(err.status || 500).json(err.message);
    }
  }

  @UserAuth()
  @Post("/lead-status")
  async updateLeadStatusToLmw(@Req() req: any, @Res() res: any) {
    try {
      const leadId = req?.body?.leadId;
      const response = await this.motorOnlineService.updateLeadStatusToLmw(
        req.body,
        leadId
      );
      return sendResponse(req, res, 200, "lead status updated", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error while updating reg number", { error });
      return res.status(err.status || 500).json(err.message);
    }
  }

  @UserAuth()
  @Post("/proposal-update")
  async updateLead(@Req() req: any, @Res() res: any) {
    try {
      const response = await this.motorOnlineService.updateLead(req.body);
      return sendResponse(req, res, 200, "lead updated", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error while updating lead", { error });
      return res.status(err.status || 500).json(err?.response);
    }
  }

  @Get("/pincode")
  async fetchPincodes(@Req() req: any, @Res() res: any) {
    try {
      const cityId = req.query?.cityId;
      const response = await this.masterApiService.getPincodeByCityId(cityId);
      return sendResponse(req, res, 200, "cities fetched", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error while fetching pincodes", { error });
      return res.status(err.status || 500).json(err.message);
    }
  }

  @UserAuth()
  @Get("/documents")
  async fetchDocuments(@Req() req: any, @Res() res: any) {
    try {
      const leadId = req.query.leadId;
      const filePathRequired = req.query.isFilePath;
      const documents = await this.motorOnlineService.getProposalDocuments(
        leadId,
        filePathRequired
      );
      return sendResponse(req, res, 200, "documents fetched", documents);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error while fetching documents", { error });
      return res.status(err.status || 500).json(err.message);
    }
  }

  @UserAuth()
  @Post("/upload-documents")
  async uploadDocuments(@Req() req: any, @Res() res: any) {
    try {
      const documents = await this.motorOnlineService.uploadProposalDocuments(
        req.body
      );
      return sendResponse(req, res, 200, "documents uploaded", documents);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error while uploading documents", { error });
      return res.status(err.status || 500).json(err.message);
    }
  }

  @UserAuth()
  @Post("/schedule-inspection")
  async scheduleInspection(@Req() req: any, @Res() res: any) {
    try {
      const response = await this.motorOnlineService.scheduleInspection(
        req.body
      );
      return sendResponse(req, res, 200, "inspection scheduled", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error while scheduling inspection", { error });
      return res.status(err?.response?.status || 500).json(err.response);
    }
  }

  @UserAuth()
  @Post("/lead-status")
  async leadStatusUpdate(@Req() req: any, @Res() res: any) {
    try {
      const response = await this.leadMiddlewareService.leadStatusUpdate(
        req.body
      );
      return sendResponse(req, res, 200, "Lead status updated", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error while scheduling inspection", { error });
      return res.status(err?.response?.status || 500).json(err.response);
    }
  }

  @UserAuth()
  @Get("/inspection-details")
  async getInspectionDetails(@Req() req: any, @Res() res: any) {
    try {
      const params = req.query;
      const processableCheckParams = {
        regNo: params.registrationNo,
        dealerId: params.dealerId,
        policyType: params.caseType,
        gibplInsurerId: params.insurerId,
        isSelfInspected: params.isSelfInspected,
      };
      const response = {};
      const headers = {
        "x-auth-id": process.env.API_ITMS_X_AUTH_ID,
        "x-auth-token": process.env.API_ITMS_X_AUTH_TOKEN,
      };
      const isInspectionProcessableResponse =
        await this.itmsService.isInspectionProcessable(
          processableCheckParams,
          headers
        );
      if (
        isInspectionProcessableResponse["status"] == "F" &&
        isInspectionProcessableResponse["msg"]
      ) {
        response["policyMessage"] = isInspectionProcessableResponse["msg"];
      }

      const inspectionDetailsParams = {
        refId: params.itmsTicketId,
        medium: params.medium,
      };

      const docsAndInspectionDetails =
        await this.itmsService.fetchDocsAndInspectionDetails(
          inspectionDetailsParams,
          headers
        );

      if (docsAndInspectionDetails.status === "T") {
        response["documents"] = docsAndInspectionDetails?.documents || [];
      }

      return sendResponse(
        req,
        res,
        200,
        "inspection details fetched",
        response
      );
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error while fetching inspection details", { error });
      return res.status(err.status || 500).json(err.message);
    }
  }

  @UserAuth()
  @Get("/inspection-history")
  async getInspectionHistory(@Req() req: any, @Res() res: any) {
    try {
      const params = req.query;
      const headers = {
        "x-auth-id": process.env.API_ITMS_X_AUTH_ID,
        "x-auth-token": process.env.API_ITMS_X_AUTH_TOKEN,
      };
      const inspectionHistory = await this.itmsService.getInspectionHistory(
        params,
        headers
      );

      return sendResponse(
        req,
        res,
        200,
        "inspection history fetched",
        inspectionHistory
      );
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error while fetching inspection history", { error });
      return res.status(err.status || 500).json(err.message);
    }
  }

  @UserAuth()
  @Post("/check-inspection-status")
  async checkInspectionStatus(@Req() req: any, @Res() res: any) {
    try {
      const params = req.query;
      const headers = {
        id: process.env.API_ITMS_X_AUTH_ID,
        Authorization: process.env.API_ITMS_X_AUTH_TOKEN,
      };
      const response = await this.motorOnlineService.checkInspectionStatus(
        params,
        headers
      );
      return sendResponse(req, res, 200, "inspection status fetched", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error while scheduling inspection", { error });
      return res.status(err.status || 500).json(err.message);
    }
  }

  @UserAuth()
  @Get("/resend-inspection-link")
  async resendInspectionLink(@Req() req: any, @Res() res: any) {
    try {
      const params = req.query;
      const response = await this.motorOnlineService.resendInspectionLink(
        params
      );
      return sendResponse(req, res, 200, "inspection link resent", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error while resending inspection link", { error });
      return res.status(err.status || 500).json(err.message);
    }
  }

  @UserAuth()
  @Post("/cancel-inspection")
  async cancelInspection(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const params = req.body;
      const loggedInUserUuid = req.userInfo?.uuid;
      const response = await this.itmsService.cancelInspection(
        params,
        loggedInUserUuid
      );
      return sendResponse(
        req,
        res,
        200,
        "inspection cancelled successfully",
        response
      );
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error while cacncelling inspection", { error });
      return res.status(err.status || 500).json(err.message);
    }
  }

  @UserAuth()
  @Get("/download-document")
  async downloadPolicy(@Req() req: any, @Res() res: any) {
    try {
      const params = req?.query;
      const response = await this.motorOnlineService.downloadPolicy(params);
      return sendResponse(
        req,
        res,
        200,
        "policy downloaded successfully",
        response
      );
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error while downloading policy", { error });
      return res.status(err.status || 500).json(err?.response?.errors);
    }
  }

  @Get("/redirect-to-new-proposal-page")
  async redirectToNewProposalPage(@Req() req: any, @Res() res: any) {
    try {
      // this api will be called for temporary purpose to integrate new motor proposal journey
      // 1) Case listing redirection
      // 2) Quotes page redirection
      // 3) Payment gateway redirection
      const params = req.query;
      const response = await this.motorOnlineService.redirectToNewProposalPage(
        params
      );
      return sendResponse(
        req,
        res,
        200,
        "redirection logic executed",
        response
      );
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error while redirecting user", { error });
      return res.status(err.status || 500).json(err.message);
    }
  }

  @Get("/pincode-details")
  async fetchPincodeDetails(@Req() req: any, @Res() res: any) {
    try {
      const params = req.query;
      const response = await this.brokerageAPIService.getPincodeDetails(params);
      return sendResponse(req, res, 200, "pincode details fetched", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error while fetching pincode details", { error });
      return res.status(err.status || 500).json(err.message);
    }
  }

  @UserAuth()
  @Get("/shorten-payment-url")
  async fetchShortenedUrl(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const pageLink = req.header("referer");
      const response = await this.itmsService.shortenUrl(pageLink);
      return sendResponse(req, res, 200, "shortened url fetched", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error while fetching shortened url", { error });
      return res.status(err.status || 500).json(err.message);
    }
  }

  @UserAuth()
  @Post("/quotes-based-on-customer-type")
  async getQuotesBasedOnCustomerType(
    @Req() req: Request,
    @Res() res: Response,
    @Body() reqBody: GetQuoteBasedOnCustomerDto
  ) {
    try {
      const response = await this.motorOnlineService.quotesBasedOnCustomerType(
        reqBody
      );
      return sendResponse(
        req,
        res,
        200,
        "customer based quotes  fetched",
        response
      );
    } catch (error) {
      Logger.error(
        "error while fetching customer based quotes from brokerage",
        error
      );
      return sendResponse(
        req,
        res,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "Error while fetching customer based quotes from brokerage",
        error
      );
    }
  }

  @Post("/")
  @DealerHierarchyAuth({ uuidPath: "body.dealerId" })
  @UserAuth()
  async createMotorLeadRequest(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Body() body: createMotorLeadRequestDto
  ) {
    try {
      const data = await this.motorOnlineService.createMotorLeadRequest(
        req.userInfo,
        body
      );
      return sendResponse(req, res, HttpStatus.OK, "Motor Lead created", data);
    } catch (err) {
      Logger.debug("Error creating Motor Lead Request:", err);
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }
}

import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import DealerService from "../services/dealer-service";
import LeadAddService from "../services/lead-add-service";
import DocumentService from "../core/api-helpers/document-service";
import { sendResponse } from "../services/helpers/response-handler";
import apiHelper from "../services/helpers/common-api-helper";
import ItmsService from "../core/api-helpers/itms-service";
import { Logger } from "@nestjs/common";
import { getQueryStringForSpecificProduct } from "../services/helpers/lead-helper";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { Response } from "express";
import CommonUtils from "../utils/common-utils";
import KycService from "../services/kyc-service";

@Controller("/v1")
@ApiTags("Lead")
export class LeadController {
  private authMiddleware: AuthMiddleware;
  constructor(
    private dealerService: DealerService,
    private leadAddService: LeadAddService,
    private documentService: DocumentService,
    private itmsService: ItmsService,
    private apiHelper: apiHelper,
    private kycService: KycService
  ) {
    this.authMiddleware = new AuthMiddleware(this.apiHelper);
  }

  @Post("/lead/:id")
  async addPosLead(@Req() request: any, @Res() response: any) {
    const data = await this.leadAddService.addData(request);
    if (data && data.meta && data.meta.statusCode == 200) {
      return sendResponse(
        request,
        response,
        200,
        "Lead added Successfully",
        data
      );
    } else {
      return sendResponse(
        request,
        response,
        400,
        "Lead added not Successfully",
        data
      );
    }
  }

  @Post("/:id/add-lead")
  async addLead(@Req() request: any, @Res() response: any) {
    const mobile = request?.body?.proposerDetails?.mobile;
    const email = request?.body?.proposerDetails?.email;
    const state = request.body.state;
    const city = request.body.city;

    const data = await this.leadAddService.addLeadData(request);
    if (data && data.meta && data.meta.statusCode == 200) {
      if (
        data &&
        data.data &&
        data.data.productType == "fire" &&
        data.data.policyMode == "offline"
      ) {
        const uploadedDoc = await this.documentService.addRegisterDocumentV2(
          request.headers,
          request.body.offlineLeadDocId
        );
        const accessId = uploadedDoc["data"]?.["docs"]?.[0]?.["access_id"];
        const fileUrl = `${process.env.DOC_SERVICE_URL}doc-service/v1/documents/${accessId}`;
        const firstName = data.data.proposerDetails.firstName;
        const lastName = data.data.proposerDetails.lastName;
        const proposerName = `${firstName} ${lastName}`;
        const comments = data.data.extraComments;
        const reqBody = {
          template_name: "SME_FIRE_POLICY_LEAD_CAPTURED_INS",
          template_variable: JSON.stringify({
            PRODUCT_TYPE: "fire",
            NAME: proposerName,
            CONTACT_NUMBER: mobile,
            CUSTOMER_EMAIL: email,
            BUSINESS_LOCATION:
              data.data.productDetails.businessDetails.addressLine1,
            BUSINESS_CITY: city,
            BUSINESS_STATE: state,
            COMMENTS: comments,
            FILE_URL: fileUrl,
          }),
          to: `{\"sme@insurancedekho.com\":\"SME\"}`,
          cc: "",
          bcc: "",
          reference_type: "",
          reference_id: "74938403904-39439-0949-94938",
          customer_uuid: "",
          subject_variable: `{\"PRODUCT_TYPE\":\"Fire\", \"GCD_CODE\":\"GID101861\"}`,
        };
        await this.itmsService.sendEmail(reqBody);
      }

      return sendResponse(
        request,
        response,
        200,
        "Lead added Successfully",
        data
      );
    } else {
      return sendResponse(
        request,
        response,
        400,
        "Lead added not Successfully",
        data
      );
    }
  }

  @Post("/:id/update-lead")
  async updateLead(@Req() request: any, @Res() response: any) {
    const data = await this.leadAddService.updateLeadData(request);
    if (data && data.meta && data.meta.statusCode == 200) {
      return sendResponse(
        request,
        response,
        200,
        "Lead Updated Successfully",
        data
      );
    } else {
      return sendResponse(
        request,
        response,
        200,
        "Lead Updated  not Successfully",
        data
      );
    }
  }

  @Get("/get-lead/:id/:lead_id")
  async getLead(@Req() request: ReqWithUser, @Res() response: Response) {
    await this.authMiddleware.use(request, response);
    const leadId = request.params.lead_id;
    const productName = request.params.id;
    let medium = "";
    if (
      request.headers["x-forwarded-host"] == process.env.X_FORWAREDED_POS_HOST
    ) {
      medium = process.env.POS_MEDIUM;
    } else {
      medium = process.env.APP_MEDIUM;
    }
    const options = {
      endpoint:
        process.env.LMW_URL +
        `non-motor-lmw/${request.params.id}/v1/leads/${leadId}`,
      method: "GET",
    };
    const queryString = getQueryStringForSpecificProduct(productName, medium);

    const data: any = await this.apiHelper.getData(options, queryString);
    Logger.debug(`Lead_data : `, data);

    const channelIamId = data.data.channelIamId;
    const dealerDetailParams = {
      iam_uuid: channelIamId,
    };

    const encryptionOptions = {
      endpoint: process.env.DECRYPTION_SERVICE_V2_END_POINT,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.DECRYPTION_SERVICE_AUTH_TOKEN,
      },
    };
    const encryptedData = this.leadAddService.prepareDataForEncryption(
      request,
      data
    );
    const [dealerDetails, encryptionResponse] = await Promise.all([
      this.dealerService.getDealerDetails(dealerDetailParams),
      encryptedData.length > 0
        ? this.apiHelper.postData(encryptionOptions, {
            data: encryptedData,
          })
        : Promise.resolve(null),
    ]);
    Logger.debug("Dealer details and encryption response", {
      dealerDetails,
      encryptionResponse,
    });
    const dealerId = dealerDetails?.[0]?.dealer_id;
    data.data.dealerId = dealerId;
    if (encryptionResponse) {
      await this.leadAddService.processEncryptionResponse(
        data,
        encryptionResponse
      );
    }
    const updatedLeadDetails = this.leadAddService.checkPolicyDocAccess(
      data,
      request.userInfo
    );
    return sendResponse(
      request,
      response,
      200,
      "Lead Fetched Successfully",
      updatedLeadDetails
    );
  }

  @Post("/:id/upload-document")
  @UseInterceptors(FileInterceptor("file"))
  async uploadDocument(
    @Req() request: any,
    @Res() response: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    const data = await this.leadAddService.uploadDoc(request, file);
    return sendResponse(
      request,
      response,
      200,
      "Document Uploaded Successfully",
      data
    );
  }

  @Get("/medical-questions/:id")
  async getMedicalQuestions(@Req() request: any, @Res() response: any) {
    const options = {
      endpoint: process.env.BROKERAGE_MOTOR_URL + `medical-questions`,
      method: "GET",
    };
    const data = await this.apiHelper.getData(options, request.query);
    return sendResponse(
      request,
      response,
      200,
      "Medical Question fetched Successfully",
      data
    );
  }

  @Post("/register-document/:id")
  async regusterDocument(@Req() request: any, @Res() response: any) {
    const data = await this.leadAddService.addRegisterDocument(request);
    return sendResponse(
      request,
      response,
      200,
      "Document Registered Successfully",
      data
    );
  }

  @Get("/:id/insurer-details")
  async getInsurerDetails(@Req() request: any, @Res() response: any) {
    const insurerSlug = request.query.insurerSlug;
    const options = {
      endpoint: process.env.BROKERAGE_MASTER_URL + `api/v1/master/insurer`,
      method: "GET",
    };
    const query = {
      insurerId: request.query.insurerId,
      subProductTypeId: request.query.subProductTypeId,
    };
    const data: any = await this.apiHelper.getData(options, query);
    const options1 = {
      endpoint:
        process.env.BROKERAGE_MASTER_URL + `api/v1/insurer-master/masterData`,
      method: "GET",
    };
    const query1 = {
      insurers: request.query.insurerSlug,
      masterType: request.query.masterType,
      subProductTypeId: request.query.subProductTypeId,
    };
    try {
      const data1: any = await this.apiHelper.getData(options1, query1);
      const finalResult = {
        validationRules: data.data.find(
          (item) => item.insurerId == request.query.insurerId
        ).validationRules,
        ...data1.data[insurerSlug],
      };
      return sendResponse(
        request,
        response,
        200,
        "Insurer Details fetched Successfully",
        finalResult
      );
    } catch (err) {
      return sendResponse(
        request,
        response,
        400,
        "Insurer Details not fetched Successfully",
        data
      );
    }
  }

  @Post("/lead/payment/otp")
  @ApiOperation({
    summary: "Submit proposal and send OTP for payment",
  })
  async sendPaymentOtp(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Body() body: any
  ) {
    try {
      await this.authMiddleware.use(req, res);
      const result = await this.leadAddService.sendPaymentOtp(
        body,
        req.userInfo
      );
      return sendResponse(req, res, 200, "ok", result);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in send payment OTP", {
        error,
        leadId: body.leadId,
        uuid: req.userInfo?.uuid,
        dealerId: body?.dealerId,
      });
      const httpStatus =
        err.response?.status || err.status || HttpStatus.INTERNAL_SERVER_ERROR;
      return sendResponse(req, res, httpStatus, "error", err?.response);
    }
  }

  @Post("/lead/payment/otp/verify")
  @ApiOperation({
    summary: "Verify OTP for payment and return payment link",
  })
  async verifyPaymentOtp(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Body() body: any
  ) {
    try {
      await this.authMiddleware.use(req, res);
      const result = await this.leadAddService.verifyPaymentOtp(
        body,
        req.userInfo
      );
      return sendResponse(req, res, 200, "ok", result);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in verify payment OTP", {
        error,
        leadId: body.leadId,
        uuid: req.userInfo?.uuid,
        dealerId: body?.dealerId,
      });
      const httpStatus =
        err.response?.status || err.status || HttpStatus.INTERNAL_SERVER_ERROR;
      return sendResponse(req, res, httpStatus, "error", err?.response);
    }
  }
  @Post("/submit-bank-details")
  @ApiOperation({
    summary: "Post Proposal Bank Details Data",
    requestBody: {
      description: "Post Proposal Bank Details Data to KYC API",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              meta: {
                product: "health",
                sub_product: "",
                insurer_id: 1,
                lead_id: "66f6756230aef7598710993a",
                source: "AGENCY",
                sub_source: "POS",
                medium: "POS",
                details: [
                  {
                    key: "bank_account_holder_name",
                    value: "Vishal Juyal",
                    doc_id: "abc",
                    masked_value: "",
                  },
                  {
                    key: "bank_account_number",
                    value: "62be94197a08e72617a05972",
                    doc_id: "",
                    masked_value: "XXXXXXXXXXX",
                  },
                ],
                correlation_id: "",
              },
            },
          },
        },
      },
    },
  })
  async submitBankDetails(@Req() req: any, @Res() res: any) {
    try {
      Logger.debug("submit proposal bank data ", {
        body: req.body,
        leadId: req.body.meta?.leadId,
      });
      const Response = await this.leadAddService.saveBankDetails(req.body);
      return sendResponse(req, res, 200, "ok", Response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in post proposal Bank Details data", {
        error,
        leadId: req.body.meta.leadId,
      });
      return sendResponse(
        req,
        res,
        err?.response?.status || err.status || 500,
        "error",
        err?.response || err
      );
    }
  }
  @Get("/bank-details")
  async fetchProposalBankDetails(@Req() req: any, @Res() res: any) {
    try {
      const query = req.query;
      const kycDataResponse = await this.kycService.getProposalBankDetails(
        query
      );
      return sendResponse(req, res, 200, "ok", kycDataResponse);
    } catch (error) {
      return sendResponse(req, res, 500, "error", error);
    }
  }
}

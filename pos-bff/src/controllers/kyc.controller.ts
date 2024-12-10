import { Controller, Post, Req, Res, Body, HttpStatus } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { sendResponse } from "../services/helpers/response-handler";
import KycService from "../services/kyc-service";
import CommonUtils from "../utils/common-utils";
import EncryptionService from "../services/encryption-service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { GetKycDocsDto } from "../dtos/life-offline/get-kyc-docs.dto";
import { Request, Response } from "express";
import ApiPosService from "../services/apipos-service";

@Controller("/v1/kyc")
@ApiTags("Kyc")
export class KycController {
  constructor(
    private posKycService: KycService,
    private encryptionService: EncryptionService,
    private apiPosService: ApiPosService
  ) {}

  @Post("/ckyc")
  @ApiOperation({
    summary: "Post Ckyc Data",
    requestBody: {
      description: "posts ckyc data to ckyc API",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              meta: {
                subSource: "insurance-dekho",
                source: "B2C",
                callbackUrl:
                  "https://posstaging.insurancedekho.com/proposal?leadId=63b2cae2ae8a3a3c8653cad3",
                insurerId: 28,
                subProductType: "FW",
                leadId: "63b2cae2ae8a3a3c8653cad3",
                productType: "motor",
                customerType: "I",
              },
              fields: [
                {
                  slug: "pan_number",
                  value: "GQBPK8700C",
                  is_additional_info: 0,
                  master_id: 1,
                  frontImage: "",
                  backImage: "",
                },
                {
                  slug: "dob",
                  value: "1997-05-04",
                  is_additional_info: 1,
                  master_id: 1,
                  frontImage: "",
                  backImage: "",
                },
              ],
              is_id_module: 0,
              is_proposal_allowed_without_kyc: 0,
              insurer_back_redirection: 0,
              kycMetaData: {
                quotesReferenceNo: "ffALgB2CRJ",
                policyCaseId: "63b3232136c9f70001cea0f7",
              },
            },
          },
        },
      },
    },
  })
  async submitCkycData(@Req() req: any, @Res() res: any) {
    try {
      Logger.debug("submit ckyc data ", {
        body: req.body,
        leadId: req.body.meta?.leadId,
      });
      const kycDetails = await this.posKycService.postCkycData(req.body);
      let data: any = { kycDetails: kycDetails || {}, redirection: null };
      if (kycDetails) {
        const lmwData: any = await this.posKycService.generateLMWPayload(
          kycDetails.kycId,
          req.body.meta?.leadId,
          req.body?.isCompanyCar
        );
        delete req.body.isCompanyCar;
        if (
          kycDetails.kycStatus === "success" ||
          kycDetails.kycStatus === "pending"
        ) {
          lmwData.kycStatus = kycDetails.kycStatus;
          lmwData.kycCode = kycDetails.kycCode;
          if (
            kycDetails.kycCode === "INSURER_REDIRECTION" ||
            kycDetails.kycCode === "DIGILOCKER_REDIRECTION"
          ) {
            lmwData.redirectUrl = kycDetails.redirectUrl;
          }
          data = await this.posKycService.updateLmw(
            lmwData,
            kycDetails,
            req.body
          );
        }
      }
      return sendResponse(req, res, 200, "ok", data);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in post ckyc data", {
        error,
        leadId: req.body.meta.leadId,
      });
      //   const data = { kycDetails: {}, redirection: null };
      return sendResponse(
        req,
        res,
        err?.response?.status || err.status || 500,
        "error",
        err?.response || err
      );
    }
  }

  @Post("/ovd")
  @ApiOperation({
    summary: "Post Okyc Data",
    requestBody: {
      description: "posts okyc data to ckyc API",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              meta: {
                subSource: "insurance-dekho",
                source: "B2C",
                callbackUrl:
                  "https://posstaging.insurancedekho.com/proposal?leadId=63b2cae2ae8a3a3c8653cad3",
                insurerId: 28,
                subProductType: "FW",
                leadId: "63b2cae2ae8a3a3c8653cad3",
                productType: "motor",
                customerType: "I",
              },
              fields: [
                {
                  slug: "aadhaar_number",
                  value: "GQBPK8700C",
                  is_additional_info: 0,
                  master_id: 1,
                  frontImage: "",
                  backImage: "",
                },
                {
                  slug: "dob",
                  value: "1997-05-04",
                  is_additional_info: 1,
                  master_id: 1,
                  frontImage: "",
                  backImage: "",
                },
                {
                  slug: "proposer_first_name",
                  value: "Srikanth",
                  is_additional_info: 1,
                  master_id: 1,
                  frontImage: "",
                  backImage: "",
                },
                {
                  slug: "proposer_last_name",
                  value: "Rachole",
                  is_additional_info: 1,
                  master_id: 1,
                  frontImage: "",
                  backImage: "",
                },
                {
                  slug: "proposer_mobile",
                  value: "9825392357",
                  is_additional_info: 1,
                  master_id: 1,
                  frontImage: "",
                  backImage: "",
                },
                {
                  slug: "proposer_email",
                  value: "fkascm@oaifjlk.com",
                  is_additional_info: 1,
                  master_id: 1,
                  frontImage: "",
                  backImage: "",
                },
                {
                  slug: "pincode",
                  value: "400001",
                  is_additional_info: 1,
                  master_id: 1,
                  frontImage: "",
                  backImage: "",
                },
              ],
              is_id_module: 0,
              is_proposal_allowed_without_kyc: 0,
              insurer_back_redirection: 0,
              kycMetaData: {
                quotesReferenceNo: "ffALgB2CRJ",
                policyCaseId: "63b3232136c9f70001cea0f7",
              },
            },
          },
        },
      },
    },
  })
  async submitOkycData(@Req() req: any, @Res() res: any) {
    try {
      Logger.debug("submit ovd data ", {
        body: req.body,
        leadId: req.body.meta?.leadId,
      });
      const kycDetails = await this.posKycService.postOvdData(req.body);
      let data: any = { kycDetails: kycDetails || {}, redirection: null };
      if (kycDetails) {
        const lmwData: any = await this.posKycService.generateLMWPayload(
          kycDetails.kycId,
          req.body.meta?.leadId,
          req.body?.isCompanyCar
        );
        delete req.body.isCompanyCar;
        if (
          kycDetails.kycStatus === "success" ||
          kycDetails.kycStatus === "pending"
        ) {
          if (
            kycDetails.kycCode === "INSURER_REDIRECTION" ||
            kycDetails.kycCode === "DIGILOCKER_REDIRECTION"
          ) {
            lmwData.redirectUrl = kycDetails.redirectUrl;
          }
          lmwData.kycStatus = kycDetails.kycStatus;
          lmwData.kycCode = kycDetails.kycCode;
          data = await this.posKycService.updateLmw(
            lmwData,
            kycDetails,
            req.body
          );
        }
      }
      return sendResponse(req, res, 200, "ok", data);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in post okyc data", {
        error,
        leadId: req.body.meta.leadId,
      });
      //   const data = { kycDetails: {}, redirection: null };
      return sendResponse(
        req,
        res,
        err?.response?.status || err.status || 500,
        "error",
        err?.response || err
      );
    }
  }

  @Post("/okyc")
  @ApiOperation({
    summary: "Post Ovd Data",
    requestBody: {
      description: "posts ovd data to ckyc API",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              meta: {
                subSource: "insurance-dekho",
                source: "B2C",
                callbackUrl:
                  "https://posstaging.insurancedekho.com/proposal?leadId=63b2cae2ae8a3a3c8653cad3",
                insurerId: 28,
                subProductType: "FW",
                leadId: "63b2cae2ae8a3a3c8653cad3",
                productType: "motor",
                customerType: "I",
              },
              fields: [],
              is_id_module: 0,
              is_proposal_allowed_without_kyc: 0,
              insurer_back_redirection: 0,
              kycMetaData: {
                quotesReferenceNo: "ffALgB2CRJ",
                policyCaseId: "63b3232136c9f70001cea0f7",
              },
            },
          },
        },
      },
    },
  })
  async submitOvdData(@Req() req: any, @Res() res: any) {
    try {
      Logger.debug("submit okyc data ", {
        body: req.body,
        leadId: req.body.meta?.leadId,
      });
      const kycDetails = await this.posKycService.postOkycData(req.body);
      let data: any = { kycDetails: kycDetails || {}, redirection: null };
      if (kycDetails) {
        const lmwData: any = await this.posKycService.generateLMWPayload(
          kycDetails.kycId,
          req.body.meta?.leadId,
          req.body?.isCompanyCar
        );
        delete req.body.isCompanyCar;
        if (
          kycDetails.kycStatus === "success" ||
          kycDetails.kycStatus === "pending"
        ) {
          if (
            kycDetails.kycCode === "INSURER_REDIRECTION" ||
            kycDetails.kycCode === "DIGILOCKER_REDIRECTION"
          ) {
            lmwData.redirectUrl = kycDetails.redirectUrl;
          }
          lmwData.kycStatus = kycDetails.kycStatus;
          lmwData.kycCode = kycDetails.kycCode;
          data = await this.posKycService.updateLmw(
            lmwData,
            kycDetails,
            req.body
          );
        }
      }
      return sendResponse(req, res, 200, "ok", data);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in post ovd data", {
        error,
        leadId: req.body.meta.leadId,
      });
      //   const data = { kycDetails: {}, redirection: null };
      return sendResponse(
        req,
        res,
        err?.response?.status || err.status || 500,
        "error",
        err?.response || err
      );
    }
  }

  @Post("/offline/ckyc")
  @ApiOperation({
    summary: "Post Offline Ckyc Data",
    requestBody: {
      description: "posts offline ckyc data to ckyc API",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              meta: {
                subSource: "insurance-dekho",
                source: "B2C",
                insurerId: 28,
                subProductType: "FW",
                leadId: "63b2cae2ae8a3a3c8653cad3",
                productType: "motor",
                customerType: "I",
                ticketId: 316772,
                tokenId: "2b66ef45324d98a2aa4e27f9792b85b7dd12724a",
              },
              fields: [
                {
                  slug: "pan_number",
                  value: "GQBPK8700C",
                  is_additional_info: 0,
                  master_id: 1,
                  frontImage: "",
                  backImage: "",
                },
                {
                  slug: "aadhar_number",
                  value: "739939294023",
                  is_additional_info: 0,
                  master_id: 1,
                  frontImage: "",
                  backImage: "",
                },
              ],
              is_id_module: 1,
              is_offline: 1,
              is_proposal_allowed_without_kyc: 0,
              insurer_back_redirection: 1,
              kycMetaData: {},
            },
          },
        },
      },
    },
  })
  async submitOfflineCkycData(@Req() req: any, @Res() res: any) {
    try {
      Logger.debug("submit offline ckyc data ", {
        body: req.body,
        tokenId: req.body.meta?.tokenId,
        ticketId: req.body.meta?.ticketId,
      });
      const kycDetails = await this.posKycService.postCkycData(req.body);
      const fields = req.body.fields;
      for (const element of fields) {
        if (element.slug == "pan_number" || element.slug == "aadhar_number") {
          const encryptionRequest = [element.value];
          const encryptedData = await this.encryptionService.encrypt(
            encryptionRequest
          );
          if (encryptedData && encryptedData[0].ecrypted) {
            kycDetails[element.slug] = encryptedData[0].ecrypted;
          }
        }
      }
      const data: any = { kycDetails: kycDetails || {} };
      return sendResponse(req, res, 200, "ok", data);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in post offline ckyc data", {
        error,
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

  @Post("/offline/ovd")
  @ApiOperation({
    summary: "Post Offline OVD Data",
    requestBody: {
      description: "posts offline ovd  data to ckyc API",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              meta: {
                subSource: "insurance-dekho",
                source: "B2C",
                insurerId: 28,
                subProductType: "FW",
                leadId: "63b2cae2ae8a3a3c8653cad3",
                productType: "motor",
                customerType: "I",
                ticketId: 316772,
                tokenId: "2b66ef45324d98a2aa4e27f9792b85b7dd12724a",
              },
              fields: [
                {
                  slug: "aadhar_card_image",
                  value: "",
                  master_id: 1,
                  frontImage: "f0f89353c86db4a5faab0017af45062b",
                  backImage: "f0f89353c86db4a5faab0017af45062b",
                },
                {
                  slug: "pan_card_image",
                  value: "",
                  master_id: 1,
                  frontImage: "f0f89353c86db4a5faab0017af45062b",
                  backImage: "",
                },
              ],
              is_id_module: 1,
              is_offline: 1,
              is_proposal_allowed_without_kyc: 0,
              insurer_back_redirection: 1,
              kycMetaData: {},
            },
          },
        },
      },
    },
  })
  async submitOfflineOvdData(@Req() req: any, @Res() res: any) {
    try {
      Logger.debug("submit offline ovd data ", {
        body: req.body,
        tokenId: req.body.meta?.tokenId,
        ticketId: req.body.meta?.ticketId,
      });
      const kycDetails = await this.posKycService.postOvdData(req.body);
      const data: any = { kycDetails: kycDetails || {} };
      return sendResponse(req, res, 200, "ok", data);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in post offline ovd data", {
        error,
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

  @Post("/documents")
  @UserAuth()
  async fetchDocumentsUrlUsingPan(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: GetKycDocsDto
  ) {
    try {
      const response = await this.apiPosService.fetchDocumentsUrlUsingPan(body);
      return sendResponse(req, res, 200, "ok", response);
    } catch (error) {
      return sendResponse(
        req,
        res,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "error",
        error
      );
    }
  }
}

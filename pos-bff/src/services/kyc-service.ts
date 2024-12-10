import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import MasterAPIService from "./master-service";
import MotorProposalService from "./motor-proposal.service";
import ViewUtils from "../utils/view-utils";
import { ConfigService } from "@nestjs/config";
import { AxiosResponse } from "axios";
import {
  HEALTH_BANK_REMOVE_DOC_FIELDS,
  HEALTH_BANK_DOC_FIELDS,
} from "../constants/master-data.constants";
import { BANK_ENCRYPTION_FIELDS } from "../constants/lmw.constants";

@Injectable()
export default class KycService {
  constructor(
    private apiHelper: CommonApiHelper,
    @Inject(forwardRef(() => MotorProposalService))
    private motorProposalService: MotorProposalService,
    private masterApiService: MasterAPIService,
    private configService: ConfigService
  ) {}

  public async postCkycData(body: any): Promise<any> {
    const options = {
      endpoint: this.configService.get("POS_KYC_ENDPOINT") + "/api/v1/kyc/ckyc",
    };

    Logger.debug("Post CKYC API", { body, options });
    const response: any = await this.apiHelper.postData(options, body);
    Logger.debug("Post CKYC API response received", response);
    return response?.data;
  }

  public async generateLMWPayload(
    kycId: string,
    leadId: string,
    isCompanyCar: number
  ) {
    const payload = { kyc_id: kycId, lead_id: leadId, isCompanyCar };
    return payload;
  }

  public async postOkycData(body: any): Promise<any> {
    const options = {
      endpoint: this.configService.get("POS_KYC_ENDPOINT") + "/api/v1/kyc/okyc",
    };

    Logger.debug("Post OKYC API", { body, options });
    const response: any = await this.apiHelper.postData(options, body);
    Logger.debug("Post OKYC API response received", response);
    return response?.data;
  }

  public async postOvdData(body: any): Promise<any> {
    const options = {
      endpoint: this.configService.get("POS_KYC_ENDPOINT") + "/api/v2/kyc/ovd",
    };

    Logger.debug("Post OVD API", { body, options });
    const response: any = await this.apiHelper.postData(options, body);
    Logger.debug("Post OVD API response received", response);
    return response?.data;
  }

  public async updateLmw(
    lmwData: any,
    kycDetails: any,
    body: any
  ): Promise<any> {
    const product = body.meta?.productType;
    const insurerId = body.meta?.insurerId;
    let data: any = { kycDetails: kycDetails || {}, redirection: null };
    await this.motorProposalService.createLead(lmwData);
    if (kycDetails?.kycStatus === "success") {
      return data;
    }

    if (kycDetails?.kycStatus === "pending") {
      if (
        kycDetails.kycCode === "INSURER_REDIRECTION" ||
        kycDetails.kycCode === "DIGILOCKER_REDIRECTION"
      ) {
        const kycConfigParams = {
          product_type: product,
          insurer_id: insurerId,
        };
        const kycConfigDetails = await this.masterApiService.getKycConfig(
          kycConfigParams
        );
        if (product) {
          if (kycConfigDetails?.status_config?.is_redirection_enabled) {
            data = {
              ...data,
              redirection: {
                eventType: "redirect_same_tab",
                kycEventPayload: { url: kycDetails.redirectUrl },
              },
            };
          } else {
            data = {
              ...data,
              redirection: {
                eventType: "redirect_new_tab",
                kycEventPayload: { url: kycDetails.redirectUrl },
              },
            };
          }
        } else {
          Logger.debug("inside it is_redirection_enabled", {
            isRedirectionEnabled: kycConfigDetails?.is_redirection_enabled,
            redirectUrl: data.payload.redirectUrl,
          });
          if (kycConfigDetails?.is_redirection_enabled) {
            data = {
              ...data,
              redirection: {
                eventType: "redirect_same_tab",
                kycEventPayload: { url: kycDetails.redirectUrl },
              },
            };
          } else {
            data = {
              ...data,
              redirection: {
                eventType: "redirect_new_tab",
                kycEventPayload: { url: kycDetails.redirectUrl },
              },
            };
          }
        }
      }
    }
    return data;
  }

  public maskKycDetails(kycDetails: any): void {
    kycDetails.kycData.address1 = ViewUtils.maskData(
      kycDetails.kycData.address1
    );
    kycDetails.kycData.address2 = ViewUtils.maskData(
      kycDetails.kycData.address2
    );
    kycDetails.kycData.address3 = ViewUtils.maskData(
      kycDetails.kycData.address3
    );
    if (kycDetails?.kycAdditionalInfo) {
      kycDetails.kycAdditionalInfo.dob = ViewUtils.maskData(
        kycDetails.kycAdditionalInfo.dob
      );
    }
    kycDetails.kycData.dob = ViewUtils.maskData(kycDetails.kycData.dob);
    kycDetails.kycData.pincode = ViewUtils.maskData(kycDetails.kycData.pincode);
  }

  public prepareBankKycDataForHealth(bankDetails: any, reqBody: any): any {
    const details = [];
    for (const key in bankDetails) {
      if (!bankDetails[key].includes(BANK_ENCRYPTION_FIELDS)) {
        if (HEALTH_BANK_DOC_FIELDS.includes(key)) {
          details.push({
            key: key,
            value: "",
            doc_id: bankDetails[key] || "",
            masked_value: "",
            doc_type:
              bankDetails[
                HEALTH_BANK_REMOVE_DOC_FIELDS[
                  HEALTH_BANK_DOC_FIELDS.indexOf(key)
                ]
              ] || "",
          });
        } else if (!HEALTH_BANK_REMOVE_DOC_FIELDS.includes(key)) {
          details.push({
            key: key,
            value: bankDetails[key],
            doc_id: bankDetails?.doc_id || "",
            masked_value: bankDetails[`${key}_masked`] || "",
            doc_type: "",
          });
        }
      }
    }

    const body = {
      product: "health",
      sub_product: reqBody?.sub_product || "",
      insurer_id: reqBody?.planData?.insurer_id || "",
      lead_id: reqBody?.visit_id || reqBody?.lead_id || "",
      source: reqBody?.source || "",
      sub_source: reqBody?.sub_source || "",
      medium: reqBody?.medium || "",
      details,
      correlation_id: reqBody?.correlation_id || "",
    };

    return body;
  }

  public async sendBankDetails(body: any): Promise<any> {
    const baseUrl = this.configService.get("POS_KYC_ENDPOINT");
    const options = {
      endpoint: baseUrl + "/api/data/v1/bank-details",
    };

    const res: AxiosResponse<any> = await this.apiHelper.postData(
      options,
      body
    );
    return res.data;
  }
  public async postProposalBankDetailsData(body: any): Promise<any> {
    const options = {
      endpoint: process.env.POS_KYC_ENDPOINT + "/api/data/v1/bank-details",
    };

    Logger.debug("Post Proposal bank Details API", { body, options });
    const response: any = await this.apiHelper.postData(options, body);
    Logger.debug("Post Proposal bank Details response received", response);
    return response?.data;
  }
  public async getProposalBankDetails(body: any): Promise<any> {
    const options = {
      endpoint: process.env.POS_KYC_ENDPOINT + `/api/data/v1/bank-details`,
      config: {
        headers: {
          "x-api-key": process.env.KYC_X_API_KEY,
        },
      },
    };

    Logger.debug("Get Proposal bank Details API", { body, options });
    const response: any = await this.apiHelper.fetchData(options, body);
    return response?.data;
  }
}

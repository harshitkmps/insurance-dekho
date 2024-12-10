import { BadRequestException, Injectable } from "@nestjs/common";
import { HealthLeadMiddlewareService } from "./health-lmw.service";
import MotorOnlineService from "./motor-online-service";
import {
  PRODUCT_TYPE,
  RENEWAL_CHATBOT_CASE_TYPE,
  RENEWAL_CHATBOT_MESSAGES,
  RENEWAL_CHATBOT_QUERY_KEY,
} from "../constants/policy.constants";
import { IRenewalLmwParamdata } from "../interfaces/lmw/renewal-service.interface";
import ContextHelper from "../services/helpers/context-helper";
import CommonApiHelper from "./helpers/common-api-helper";

@Injectable()
export default class Policyservice {
  constructor(
    private healthMiddlewareService: HealthLeadMiddlewareService,
    private motorOnlineService: MotorOnlineService,
    private apiHelper: CommonApiHelper
  ) {}

  public async getPolicyDoc(
    policyNumber: string,
    dealerId: number,
    product: string
  ): Promise<any> {
    if (product !== "health") {
      throw new BadRequestException(
        `cannot fetch policy doc for ${product} policy`
      );
    }
    try {
      const policyDocResponse =
        await this.healthMiddlewareService.fetchPolicyDoc({
          policyNumber,
          dealerId,
        });
      return {
        leadId: policyDocResponse?.lead_id,
        policyDocUrl: policyDocResponse?.url,
      };
    } catch (error) {
      throw new BadRequestException("no policy details found");
    }
  }

  public async getRenewalChatbotData(
    policyNumber: string,
    registrationNumber: string,
    dealerId: number,
    product: string,
    queryType: string,
    partnerEmail: string,
    gcdCode: string
  ): Promise<any> {
    try {
      let caseType;
      let caseValue;
      let response;
      let responseFound = 0;
      if (registrationNumber) {
        caseType = RENEWAL_CHATBOT_CASE_TYPE.registration_number;
        caseValue = registrationNumber;
        const params: IRenewalLmwParamdata = {
          registration_number: registrationNumber,
          dealer_id: dealerId,
          is_renewal_chatbot: true,
          is_renewal: 1,
        };
        response = await this.motorOnlineService.fetchMotorRenewalData(params);
        if (response?.lead_id) {
          responseFound = 1;
        }
      }
      if (policyNumber && !responseFound) {
        caseType = RENEWAL_CHATBOT_CASE_TYPE.policy_number;
        caseValue = policyNumber;
        const params: IRenewalLmwParamdata = {
          policy_number: policyNumber,
          dealer_id: dealerId,
          is_renewal_chatbot: true,
          is_renewal: 1,
        };
        if (registrationNumber) {
          response = await this.motorOnlineService.fetchMotorRenewalData(
            params
          );
          if (response?.lead_id) {
            responseFound = 1;
          }
        }
        if (!responseFound) {
          response = await this.fetchRenewalChatbotDataByPolicy(
            params,
            product
          );
          if (!response?.lead_id && !product) {
            response =
              await this.healthMiddlewareService.fetchHealthRenewalData(params);
            if (!response?.lead_id) {
              response = await this.motorOnlineService.fetchMotorRenewalData(
                params
              );
            }
          }
        }
      }
      if (response?.lead_id) {
        let formattedResponse = this.formatRenewalChatbotResponse(response);
        const sendMailCommonData = {
          product: formattedResponse?.product,
          leadId: response?.lead_id,
          dealerId: dealerId,
          partnerEmail: partnerEmail,
          gcdCode: gcdCode,
        };
        if (
          !formattedResponse?.renewalNoticeUrl &&
          queryType === RENEWAL_CHATBOT_QUERY_KEY.renewal_notice
        ) {
          let statusCode;
          const sendRnMailData = {
            ...sendMailCommonData,
            queryKey: queryType,
            caseType: caseType,
            caseValue: caseValue,
          };
          const commResponse = await this.sendMailToAdvisor(sendRnMailData);
          if (
            commResponse &&
            commResponse.statusCode === 200 &&
            commResponse.status === "T"
          ) {
            statusCode = "CH002";
          } else if (
            commResponse.message ===
            RENEWAL_CHATBOT_MESSAGES.RENEWAL_CHATBOT_MAIL_ALREADY_TRIGGERED
          ) {
            statusCode = "CH003";
          }
          if (statusCode) {
            formattedResponse = {
              ...formattedResponse,
              statusCode: statusCode,
            };
          }
        }
        if (
          !formattedResponse?.insurerOfflinePaymentUrl &&
          queryType === RENEWAL_CHATBOT_QUERY_KEY.offline_payment_insurer_link
        ) {
          let statusCode;
          const sendOfflinePaymentLinkMailData = {
            ...sendMailCommonData,
            queryKey: queryType,
            caseType: caseType,
            caseValue: caseValue,
          };
          const commResponse = await this.sendMailToAdvisor(
            sendOfflinePaymentLinkMailData
          );
          if (
            commResponse &&
            commResponse.statusCode === 200 &&
            commResponse.status === "T"
          ) {
            statusCode = "CH002";
          } else if (
            commResponse.message ===
            RENEWAL_CHATBOT_MESSAGES.RENEWAL_CHATBOT_MAIL_ALREADY_TRIGGERED
          ) {
            statusCode = "CH003";
          }
          if (statusCode) {
            formattedResponse = {
              ...formattedResponse,
              statusCode: statusCode,
            };
          }
        }
        return formattedResponse;
      }
      throw new BadRequestException(RENEWAL_CHATBOT_MESSAGES.NO_LEAD_PRESENT);
    } catch (error) {
      throw new BadRequestException(RENEWAL_CHATBOT_MESSAGES.NO_LEAD_PRESENT);
    }
  }

  private async fetchRenewalChatbotDataByPolicy(
    params: IRenewalLmwParamdata,
    product: string
  ): Promise<any> {
    if (product === PRODUCT_TYPE.health) {
      return await this.healthMiddlewareService.fetchHealthRenewalData(params);
    }
    if (product === PRODUCT_TYPE.motor) {
      return await this.motorOnlineService.fetchMotorRenewalData(params);
    }

    return {};
  }

  private formatRenewalChatbotResponse(response: any) {
    const product = response?.product_type;
    let formattedResponse: any = {
      renewalNoticeUrl: response?.renewal_doc_url,
      insurerOfflinePaymentUrl: response?.bitly_url,
      product: product,
    };
    if (response?.is_integrated && product === PRODUCT_TYPE.health) {
      const paySecurelyLink = this.getHealthSummaryUrl(response.lead_id);

      formattedResponse = {
        ...formattedResponse,
        insurerOfflinePaymentUrl: paySecurelyLink,
      };
    } else if (!response?.bitly_url && product === PRODUCT_TYPE.health) {
      formattedResponse = {
        ...formattedResponse,
        insurerOfflinePaymentUrl: response?.payment_offline_link,
      };
    }
    formattedResponse = Object.fromEntries(
      Object.entries(formattedResponse).filter(([_, value]) => value !== "")
    );
    return formattedResponse;
  }

  private getHealthSummaryUrl(leadId: string) {
    const medium = ContextHelper.getStore().get("medium");
    const link =
      (medium === process.env.POS_MEDIUM
        ? process.env.POS_URL
        : process.env.POS_APP_URL) +
      "/healthpayment?token=" +
      leadId;
    return link;
  }

  public async sendMailToAdvisor(paramData) {
    try {
      const options: any = {
        endpoint: `${process.env.RENEWAL_SERVICE}/communication/v1/${paramData.product}/chatbot/notify-advisor`,
        config: {
          timeout: process.env.LMW_CASE_COUNT_TIMEOUT ?? 100000,
        },
      };
      const response: any = await this.apiHelper.fetchData(options, paramData);
      return response;
    } catch (error) {
      throw new BadRequestException("Error in sending mail");
    }
  }
}

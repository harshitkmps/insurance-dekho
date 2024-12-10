import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import { LeadMiddlewareService } from "../core/api-helpers/lead-middleware.service";
import { TEMPLATES } from "../constants/communication.constants";
import { LMWConstants } from "../constants/lmw.constants";
import UtilityService from "./utility-service";
import ItmsService from "../core/api-helpers/itms-service";

import NonMotorLmwService from "./non-motor-lmw.service";

@Injectable()
export default class CommunicationService {
  constructor(
    private commonApiHelper: CommonApiHelper,
    private lmwService: LeadMiddlewareService,
    private utilityService: UtilityService,
    private itmsService: ItmsService,
    private nonMotorLmwService: NonMotorLmwService
  ) {}

  public async sendOtp(body: any) {
    try {
      const data: any = {};
      if (body?.mobile) {
        data.mobile = body.mobile;
        data.type = "1";
      }
      if (body?.email) {
        data.email = body.email;
        data.type = "2";
      }
      const smsTemplate = TEMPLATES[body?.smsTemplate];
      if (smsTemplate) {
        data.smsTemplate = smsTemplate;
      }
      const options = {
        endpoint: `${process.env.COMMUNICATION_SERVICE_URL}/api/v2/send-otp`,
        config: {
          headers: {
            "x-api-key": process.env.COMMUNICATION_SERVICE_X_API_KEY,
            "Content-Type": "application/json",
          },
        },
      };
      const response = await this.commonApiHelper.postData(options, data);
      if (response?.statusCode !== 200 || response?.status !== "T") {
        throw response;
      }

      const { authCode, message } = response;
      return {
        authCode,
        message,
      };
    } catch (error) {
      Logger.error("Error sending otp", { error });
      throw new HttpException(
        error?.response?.message ?? error?.message ?? "Unable to send otp",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async verifyOtp(otp: string, authCode: string) {
    try {
      const body = {
        otp,
        authCode,
      };
      const options = {
        endpoint: `${process.env.COMMUNICATION_SERVICE_URL}/verifyOtp`,
        config: {
          headers: {
            "x-api-key": process.env.COMMUNICATION_SERVICE_X_API_KEY,
            "Content-Type": "application/json",
          },
        },
      };
      const response = await this.commonApiHelper.postData(options, body);
      if (response?.statusCode !== 200 || response?.status !== "T") {
        throw response;
      }

      return {
        message: "OTP Verified",
      };
    } catch (error) {
      Logger.error("Error while otp verification", { error });
      throw new HttpException(
        error?.response?.message ?? error?.message ?? "Unable to verify otp",
        error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async sendSMS(body: any): Promise<any> {
    const options = {
      endpoint: `${process.env.COMMUNICATION_SERVICE_URL}/send_sms`,
      config: {
        headers: {
          "x-api-key": process.env.COMMUNICATION_SERVICE_X_API_KEY,
          "Content-Type": "application/json",
        },
      },
    };

    const response = await this.commonApiHelper.postData(options, body);
    return JSON.parse(response.data);
  }

  public async shareDocuments(body: any): Promise<any> {
    const options = {
      endpoint: `${process.env.API_POS_ENDPOINT}/v1/share`,
    };
    const response = await this.commonApiHelper.postData(options, body);
    return response.data;
  }

  public async shareLink(body: any): Promise<any> {
    const options = {
      endpoint: `${process.env.API_LMW_ENDPOINT}/api/life/v1/lead/shareFeatures`,
    };
    const response = await this.commonApiHelper.postData(options, body);
    return response.data;
  }

  public async shareLinkService(body: any): Promise<any> {
    const { currentPage, leadId, productType, cityId } = body;

    const relativeUrl = await this.getRelativeUrl({
      bucket: currentPage,
      leadId,
      cityId,
      product: productType,
    });
    const hostUrl = await this.getHostUrl({ product: productType });
    const pageLink = `${hostUrl}${relativeUrl}`;

    const requestedBody = {
      ...body,
      url: pageLink,
    };

    const response = await this.lmwService.shareLink(
      requestedBody,
      productType
    );

    return response;
  }

  public async getRelativeUrl({ bucket, leadId, cityId, product }) {
    const relativeUrlMapping = {
      fire: {
        confirm: `posui/fire-insurance/confirm?request=${leadId}`,
      },
      specificMarine: {
        confirm: `posui/specific-marine-insurance/confirm?request=${leadId}`,
      },
      workmenCompensation: {
        confirm: `posui/workmen-compensation-insurance/confirm?request=${leadId}`,
      },
      professionalIndemnity: {
        confirm: `posui/professional-indemnity-insurance/confirm?request=${leadId}`,
      },
      home: {
        confirm: `posui/home-insurance/confirm?request=${leadId}`,
      },
      wellness: {
        quotes: `posui/wellness/quotes?request=${leadId}&cityId=${cityId}`,
        proposal: `posui/wellness/checkout?request=${leadId}`,
        payment: `posui/wellness/confirm?request=${leadId}`,
      },
    };

    return relativeUrlMapping[product]?.[bucket] ?? null;
  }

  public async getHostUrl({ product }) {
    // To club all SME products into one
    if (LMWConstants.SME_PRODUCT_TYPES.includes(product)) {
      product = "sme";
    }

    const hostUrlMapping = {
      sme: process.env.POS_UI_ENDPOINT,
      wellness: process.env.POS_IDEDGE_ENDPOINT,
    };

    return hostUrlMapping[product] ?? null;
  }

  public async motorPaymentDropoff() {
    const motorPaymentDropoffData: any =
      await this.nonMotorLmwService.generateMotorPaymentDropoffData();
    const caseListingUrl = `${process.env.POS_URL}/core/case-listing#paymentPending`;
    const shortenedCaseListingUrl = await this.itmsService.shortenUrl(
      caseListingUrl
    );
    const motorPaymentDropoffDataforUpload = motorPaymentDropoffData?.data?.map(
      (userData) => {
        return {
          type: "event",
          data: {
            eventName: "motor_dropoff_communication",
            userId: userData?.uuid,
            Total_premium: `Rs ${userData?.premium}`,
            Motor_payment_pending_policy_count: userData?.policyCount,
            motor_case_listing: shortenedCaseListingUrl?.url,
            partner_name: userData?.dealerName,
          },
        };
      }
    );
    const data = await this.utilityService.uploadData(
      "motorDropoffCommunication",
      null,
      null,
      "POS",
      process.env.PAYMENT_DROPOFF_EMAIL,
      null,
      motorPaymentDropoffDataforUpload
    );

    return data;
  }
}

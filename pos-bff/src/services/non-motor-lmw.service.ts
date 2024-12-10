import {
  BucketMapping,
  PolicyMedium,
} from "../constants/case-listing.constants";
import DateTimeUtils from "../utils/date-time-utils";
import CommonApiHelper from "./helpers/common-api-helper";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export default class NonMotorLmwService {
  constructor(private apiHelper: CommonApiHelper) {}

  public async sharePaymentLink(body: any, productType: string): Promise<any> {
    const options = {
      endpoint: `${process.env.LMW_URL}non-motor-lmw/${productType}/v1/payment-share-link?medium=${process.env.POS_MEDIUM}`,
    };
    Logger.debug(`Request to share link for ${productType} received`, {
      body,
    });
    const response: any = await this.apiHelper.postData(options, body);
    Logger.debug(`Request to share link for ${productType} received`, {
      options,
      response,
    });
    return response.data;
  }

  public async sendPaymentOtp(params: any): Promise<any> {
    const options: any = {
      endpoint:
        process.env.LMW_URL +
        `non-motor-lmw/${params.product}/v1/leads/payment/otp?medium=${params.medium}`,
      config: {
        timeout: 100000,
      },
    };
    Logger.debug("non-motor proposal submission endpoint POS", {
      options,
      params,
    });
    const leadDetailsResponseData: any = await this.apiHelper.postData(
      options,
      params
    );
    Logger.debug("proposal submission Response POS", leadDetailsResponseData);
    return leadDetailsResponseData;
  }

  public async verifyPaymentOtp(params: any): Promise<any> {
    const options: any = {
      endpoint:
        process.env.LMW_URL +
        `non-motor-lmw/${params.product}/v1/leads/payment/otp-verify?medium=${params.medium}`,
    };
    Logger.debug("non-motor proposal submission endpoint POS", {
      options,
      params,
    });
    const leadDetailsResponseData: any = await this.apiHelper.postData(
      options,
      params
    );
    Logger.debug("proposal submission Response POS", leadDetailsResponseData);
    return leadDetailsResponseData;
  }

  public generateDropOffDataCollectionParams() {
    const { startDate, endDate } = DateTimeUtils.getStartAndEndDateFromToday(7);

    const params = {
      filters: JSON.stringify({
        createdDateRange: {
          startDate,
          endDate,
        },
        bucket: BucketMapping.paymentPending,
        policyMedium: PolicyMedium.ONLINE,
        source: "ucd,saathi,agency,partner,enterprise",
        groupDataByDealerIds: true,
      }),
      medium: "POS",
    };
    return params;
  }

  public async generateMotorPaymentDropoffData(): Promise<any> {
    const options = {
      endpoint: `${process.env.LMW_URL}motor/v1/aggregate`,
      config: {
        timeout: 100000,
      },
    };

    const params = this.generateDropOffDataCollectionParams();
    const motorPaymentDropoffData: any = await this.apiHelper.fetchData(
      options,
      params
    );
    return motorPaymentDropoffData;
  }

  public async updateLead(params: any) {
    const options: any = {
      endpoint:
        process.env.LMW_URL +
        `non-motor-lmw/${params.product}/v1/leads?medium=${params.medium}`,
      config: {
        timeout: 100000,
      },
    };
    Logger.debug("updating lead data ", { options, params });
    const response = await this.apiHelper.putData(options, params);
    return response;
  }
}

import { ConfigService } from "@nestjs/config";
import CommonApiHelper from "./helpers/common-api-helper";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";

@Injectable()
export class HealthLeadMiddlewareService {
  constructor(
    private apiHelper: CommonApiHelper,
    private configService: ConfigService
  ) {}

  public async addHealthLead(data: any): Promise<any> {
    const baseUrl = this.configService.get("API_LMW_HEALTH_URL");
    const options = {
      endpoint: `${baseUrl}/health/leads/create`,
    };
    const response = await this.apiHelper.postData(options, data);
    return response;
  }

  public async sharePaymentLink(body: any, productType: string): Promise<any> {
    const options = {
      endpoint: `${process.env.API_LMW_HEALTH_URL}/${productType}/payment/share-payment-details?medium=${process.env.POS_MEDIUM}`,
    };
    Logger.debug(`Request to share link for ${productType} received`, {
      body,
    });
    const response: any = await this.apiHelper.postData(options, body);
    Logger.debug(`Request to share link for ${productType} received`, {
      options,
      response,
    });
    return response;
  }

  public async sendPaymentOtp(params: any): Promise<any> {
    const options: any = {
      endpoint: process.env.API_LMW_HEALTH_URL + `/health/proposer/payment/otp`,
    };
    Logger.debug("motor proposal submission endpoint POS", { options, params });
    const leadDetailsResponseData: any = await this.apiHelper.postData(
      options,
      params
    );
    Logger.debug("proposal submission Response POS", leadDetailsResponseData);
    return leadDetailsResponseData.result;
  }

  public async verifyPaymentOtp(params: any): Promise<any> {
    const options: any = {
      endpoint:
        process.env.API_LMW_HEALTH_URL + `/health/proposer/payment/otp/verify`,
    };
    Logger.debug("motor proposal submission endpoint POS", { options, params });
    const leadDetailsResponseData: any = await this.apiHelper.postData(
      options,
      params
    );
    Logger.debug("proposal submission Response POS", leadDetailsResponseData);
    return leadDetailsResponseData.result;
  }

  public async fetchPolicyDoc(body: any): Promise<any> {
    const options: any = {
      endpoint: `${process.env.API_LMW_HEALTH_URL}/health/policy/policy-doc-details`,
    };
    const policyDocResponse: any = await this.apiHelper.postData(options, body);
    return policyDocResponse?.result;
  }

  public async saveNomineeDetails(data: any): Promise<any> {
    try {
      const baseUrl = this.configService.get("API_LMW_HEALTH_URL");
      const options = {
        endpoint: `${baseUrl}/health/nominee/save-nominee-details`,
      };
      const response = await this.apiHelper.postData(options, data);
      return response;
    } catch (error) {
      throw new HttpException(
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }

  public async saveCommunicationDetails(data: any): Promise<any> {
    try {
      const baseUrl = this.configService.get("API_LMW_HEALTH_URL");
      const options = {
        endpoint: `${baseUrl}/health/communication/save-communication-details`,
      };
      const response = await this.apiHelper.postData(options, data);
      return response;
    } catch (error) {
      throw new HttpException(
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }

  public async fetchHealthRenewalData(body: any): Promise<any> {
    try {
      const options: any = {
        endpoint: `${process.env.API_LMW_HEALTH_URL}/health/renewal/search-policy`,
      };
      const response: any = await this.apiHelper.postData(options, body);
      return response?.result;
    } catch (error) {
      throw new HttpException(
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }
}

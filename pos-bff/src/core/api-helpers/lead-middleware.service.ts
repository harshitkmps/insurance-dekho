import { ConfigService } from "@nestjs/config";
import {
  healthRenewalNoticeUrl,
  motorRenewalNoticeUrl,
} from "../../constants/case-listing.constants";
import CommonApiHelper from "../../services/helpers/common-api-helper";
import { Injectable, Logger } from "@nestjs/common";
import { AxiosResponse } from "axios";
import { AddAlternateQuotesBody } from "@/src/interfaces/lead-middleware/add-alternate-quotes.interface";

@Injectable()
export class LeadMiddlewareService {
  constructor(
    private apiHelper: CommonApiHelper,
    private configService: ConfigService
  ) {}

  public async addShareQuotes(body: any): Promise<any> {
    Logger.debug("add share quotes API LMW", { body });
    const options = {
      endpoint: process.env.API_LMW_ENDPOINT + "/api/v1/addShareQuote",
    };

    const response: any = await this.apiHelper.postData(options, body);
    return response.data;
  }

  public async downloadRenewalNotice(body: any): Promise<any> {
    try {
      Logger.debug("Download Renewal Notice from LMW", { body });
      if (body.product === "Motor") {
        const options = {
          endpoint: motorRenewalNoticeUrl + body.leadId,
          method: "GET",
        };
        const response: any = await this.apiHelper.getData(options, {});
        return response.data.renewal_doc_url;
      } else if (body.product === "Health") {
        const options = {
          endpoint: healthRenewalNoticeUrl,
        };
        const response: any = await this.apiHelper.postData(options, {
          visit_id: body.leadId,
        });
        return response.result.renewal_doc_url;
      }

      throw "Unknown product for Renewal Notice";
    } catch (err) {
      Logger.error("error while fetching renewal notice ", { err });
      throw err;
    }
  }

  public async addToCart(body: any): Promise<any> {
    try {
      const options = {
        endpoint: `${process.env.API_QMW_HEALTH_URL}/health/cart/add`,
      };
      Logger.debug("Personal Accident Add to cart", { body });
      const response: any = await this.apiHelper.postData(options, body);
      Logger.debug("Personal Accident API Response", {
        options,
        response,
      });
      return response.result;
    } catch (err) {
      Logger.error("error in health quotes API", { err });
      const response = {};
      return response;
    }
  }

  public async shareLink(body: any, productType: string): Promise<any> {
    try {
      const options = {
        endpoint: `${process.env.LMW_URL}non-motor-lmw/${productType}/v1/share-link?medium=${process.env.POS_MEDIUM}`,
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
    } catch (err) {
      Logger.error("error in sharing API", { err });
      const response = {};
      return response;
    }
  }

  public async shareSMEQuotes(productType: string, payload: any): Promise<any> {
    try {
      Logger.debug("Share SME Quotes API LMW", {
        productType,
        payload,
      });

      const options = {
        endpoint: `${process.env.LMW_URL}non-motor-lmw/${productType}/v1/shareQuotes`,
        config: { params: { medium: process.env.POS_MEDIUM } },
      };
      const response: any = await this.apiHelper.postData(options, payload);

      return response?.data;
    } catch (error) {
      Logger.error("error in share SME Quotes API", { error });
      const response = {};
      return response;
    }
  }

  public async getMotorProposalInfo(queryParams: any) {
    const options = {
      endpoint: process.env.API_LMW_ENDPOINT + `/api/v1/proposal`,
    };

    const leadDetails: any = await this.apiHelper.fetchData(
      options,
      queryParams
    );
    Logger.debug("proposal get API response", leadDetails.data);
    return leadDetails.data;
  }

  public async leadStatusUpdate(body): Promise<any> {
    const options = {
      endpoint: process.env.API_LMW_ENDPOINT + `/api/v2/lead/updateStatus`,
      method: "POST",
    };
    const response: any = await this.apiHelper.getData(options, body);
    return response;
  }
  public async sharePaymentLink(params: any) {
    const options = {
      endpoint: `${process.env.API_LMW_ENDPOINT}/api/v1/share-payment-link`,
    };
    Logger.debug("share payment link", { options, params });
    const res = await this.apiHelper.postData(options, params);
    Logger.debug("Share payment link response", res);
    return res.data;
  }

  public async submitMotorProposalPos(params: any): Promise<any> {
    const options = {
      endpoint:
        process.env.API_LMW_ENDPOINT +
        `/api/v1/proposal/submit/${params.leadId}`,
    };
    Logger.debug("motor proposal submission endpoint POS", { options, params });
    const leadDetailsResponseData: any = await this.apiHelper.fetchData(
      options,
      params
    );
    Logger.debug("proposal submission Response POS", leadDetailsResponseData);
    return leadDetailsResponseData.data;
  }

  public async sendPaymentOtp(params: any): Promise<any> {
    const options: any = {
      endpoint: process.env.API_LMW_ENDPOINT + "/api/v1/payment/otp",
    };
    Logger.debug("motor proposal submission endpoint POS", { options, params });
    const leadDetailsResponseData: any = await this.apiHelper.postData(
      options,
      params
    );
    Logger.debug("proposal submission Response POS", leadDetailsResponseData);
    return leadDetailsResponseData.data;
  }

  public async verifyPaymentOtp(params: any): Promise<any> {
    const options: any = {
      endpoint: process.env.API_LMW_ENDPOINT + "/api/v1/payment/otp/verify",
    };
    Logger.debug("motor proposal submission endpoint POS", { options, params });
    const leadDetailsResponseData: any = await this.apiHelper.postData(
      options,
      params
    );
    Logger.debug("proposal submission Response POS", leadDetailsResponseData);
    return leadDetailsResponseData.data;
  }

  public async getRtoDetails(body: any): Promise<any> {
    const options = {
      endpoint:
        this.configService.get("API_LMW_ENDPOINT") + "/api/v1/getRtoDetails",
    };
    const res: AxiosResponse<any> = await this.apiHelper.postData(
      options,
      body
    );
    return res;
  }

  public async downloadMotorPolicyDoc(leadId: string): Promise<any> {
    Logger.debug("Download Policy Doc from LMW", { leadId });

    const options = {
      endpoint: process.env.API_LMW_ENDPOINT + `/api/v1/lead/${leadId}`,
      method: "GET",
    };
    const response: any = await this.apiHelper.getData(options, {});
    return response?.data?.policy_doc_link;
  }

  public async createLead(params: any): Promise<any> {
    const options = {
      endpoint: `${this.configService.get("API_LMW_ENDPOINT")}/api/v1/lead`,
    };
    Logger.debug("creating motor lead", { options, params });
    const res: AxiosResponse<any> = await this.apiHelper.postData(
      options,
      params
    );
    Logger.debug("motor create lead response", { data: res.data });
    return res.data;
  }

  public async getPolicyLink(leadId: string, params: any): Promise<any> {
    const options = {
      endpoint: process.env.API_LMW_ENDPOINT + `/api/v1/policyDoc/${leadId}`,
      method: "GET",
    };
    const res: AxiosResponse<any> = await this.apiHelper.getData(
      options,
      params
    );
    return res.data;
  }

  public async addAlternateQuotes(body: AddAlternateQuotesBody): Promise<any> {
    const baseUrl = await this.configService.get("API_LMW_ENDPOINT");
    const options = {
      endpoint: `${baseUrl}/api/v1/lead/alternate-quotes`,
    };
    Logger.debug("Adding alternate quotes in LMW", { options, body });

    const response: AxiosResponse<any> = await this.apiHelper.postData(
      options,
      body
    );
    return response.data;
  }
}

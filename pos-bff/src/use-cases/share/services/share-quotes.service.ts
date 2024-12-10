import { LeadMiddlewareService } from "../../../core/api-helpers/lead-middleware.service";
import { HttpException, Injectable } from "@nestjs/common";

@Injectable()
export default class ShareQuotesService {
  constructor(private leadMiddlewareService: LeadMiddlewareService) {}

  public async shareQuotes(body: any): Promise<any> {
    const shareQuotesAPIMapper = {
      motor: async () => this.leadMiddlewareService.addShareQuotes(body),
      health: async () => this.leadMiddlewareService.addShareQuotes(body),
      investment: async () => this.leadMiddlewareService.addShareQuotes(body),
      wellness: async () => this.leadMiddlewareService.addShareQuotes(body),
      fire: async () => this.shareSMEQuotes(body),
      specificMarine: async () => this.shareSMEQuotes(body),
      workmenCompensation: async () => this.shareSMEQuotes(body),
      professionalIndemnity: async () => this.shareSMEQuotes(body),
      home: async () => this.shareSMEQuotes(body),
    };

    const { productType = null } = body;
    if (!productType) {
      throw new HttpException("Invalid productType for share quotes", 400);
    }

    const shareQuotesRes = await shareQuotesAPIMapper[productType]();
    return shareQuotesRes;
  }

  public async shareSMEQuotes(body: any): Promise<any> {
    const {
      productType = null,
      planList = [],
      productDetails = {},
      ...restBody
    } = body;

    const reqPlanList = planList?.map(({ premiumData, ...restPlan }) => ({
      ...restPlan,
      premiumData: {
        ...premiumData,
        "1_year": {
          ...premiumData["1_year"],
          premiumBreakup: productDetails?.premiumBreakup || [],
        },
      },
    }));

    delete productDetails?.premiumBreakup;
    const payload = {
      ...restBody,
      planList: reqPlanList,
      productDetails,
    };

    const shareQuotesRes = await this.leadMiddlewareService.shareSMEQuotes(
      productType,
      payload
    );
    return shareQuotesRes;
  }
}

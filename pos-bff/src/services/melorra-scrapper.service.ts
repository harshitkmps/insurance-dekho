import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import CommonApiHelper from "./helpers/common-api-helper";
import { UseCache } from "../decorators/use-cache.decorator";
import {
  LOB_TREND_PROJECTIONS,
  PARTNER_COHORTS_PROJECTIONS,
  SALES_AGGREGATES_LOB_PROJECTIONS,
  TARGETS_PROJECTIONS,
} from "../constants/dashboard.constants";
import {
  SalesAggregatesBody,
  SalesAggregatesFilters,
  SalesSubCategoryAggregateFilters,
  SalesSubCategoryAggregatesBody,
} from "../interfaces/melorra-scrapper/sales-aggregates.interface";
import {
  SalesTargetsBody,
  SalesTargetsFilters,
} from "../interfaces/melorra-scrapper/sales-targets.interface";
import {
  PartnerCohortCountBody,
  PartnerCohortFilters,
} from "../interfaces/melorra-scrapper/partner-base-dealer-count.interface";
import { PartnerBaseDealersBody } from "../interfaces/melorra-scrapper/partner-base-dealers.interface";
import {
  MonthlySubCategoryAggregateFilters,
  ProductBreakupMonthwiseAggregatesBody,
  ProductMonthlyAggregatesFilters,
} from "../interfaces/melorra-scrapper/month-wise-aggregates.interface";

@Injectable()
export class MelorraScrapperService {
  constructor(
    private configService: ConfigService,
    private apiHelper: CommonApiHelper
  ) {}

  public async getDealersCount(body: PartnerCohortCountBody): Promise<any> {
    const baseUrl = await this.configService.get("API_CENTRAL_URL");
    const options = {
      endpoint: baseUrl + "/v2/pos/aggregates/dealers/count",
    };

    const res: any = await this.apiHelper.postData(options, body);

    if (res.status !== HttpStatus.OK) {
      throw new HttpException(res.errors, res.status);
    }

    return res.data;
  }

  public async getDealers(body: PartnerBaseDealersBody): Promise<any> {
    const baseUrl = await this.configService.get("API_CENTRAL_URL");
    const options = {
      endpoint: baseUrl + "/v2/pos/aggregates/dealers",
    };

    const res: any = await this.apiHelper.postData(options, body);

    if (res.status !== HttpStatus.OK) {
      throw new HttpException(res.errors, res.status);
    }

    return res.data;
  }

  public async getMonthlyTrends(body: any): Promise<any> {
    const baseUrl = await this.configService.get("API_CENTRAL_URL");
    const options = {
      endpoint: baseUrl + "/v2/pos/aggregates/month_wise",
    };

    const res: any = await this.apiHelper.postData(options, body);

    if (res.status !== HttpStatus.OK) {
      throw new HttpException(res.errors, res.status);
    }

    return res.data;
  }

  @UseCache({ expiryTimer: 1800, useObjectAsKey: true })
  public async getProductBreakupMonthlyTrends(
    product: string,
    filters: MonthlySubCategoryAggregateFilters
  ): Promise<any> {
    const projections: string[] = LOB_TREND_PROJECTIONS[product.toLowerCase()];
    const body: ProductBreakupMonthwiseAggregatesBody = {
      filters,
      projections,
    };
    const baseUrl = await this.configService.get("API_CENTRAL_URL");
    const options = {
      endpoint: baseUrl + `/v2/pos/${product}/aggregates/month_wise`,
    };

    const res: any = await this.apiHelper.postData(options, body);

    if (res.status !== HttpStatus.OK) {
      throw new HttpException(res.errors, res.status);
    }

    return res.data;
  }

  public async getSalesAggregates(body: SalesAggregatesBody): Promise<any> {
    const options = {
      endpoint: process.env.API_CENTRAL_URL + `/v2/pos/aggregates`,
    };
    const res = await this.apiHelper.postData(options, body);
    if (res.status !== HttpStatus.OK) {
      throw new HttpException(res.errors, res.status);
    }
    return res.data;
  }

  @UseCache({ expiryTimer: 3600, useObjectAsKey: true })
  public async getLobWiseSalesAggregates(
    filters: SalesAggregatesFilters,
    product: string
  ): Promise<any> {
    const body: SalesAggregatesBody = {
      filters: { ...filters, lob: product },
      projections: SALES_AGGREGATES_LOB_PROJECTIONS[product],
    };
    const res = await this.getSalesAggregates(body);
    return res;
  }

  @UseCache({ expiryTimer: 1200, useObjectAsKey: true }) // 20 min
  public async getProductBreakupSalesAggregates(
    product: string,
    filters: SalesSubCategoryAggregateFilters
  ): Promise<any> {
    const projections: string[] = LOB_TREND_PROJECTIONS[product.toLowerCase()];
    const body: SalesSubCategoryAggregatesBody = {
      filters,
      projections,
    };
    const baseUrl = await this.configService.get("API_CENTRAL_URL");
    const options = {
      endpoint: baseUrl + `/v2/pos/${product}/aggregates`,
    };

    const res: any = await this.apiHelper.postData(options, body);

    if (res.status !== HttpStatus.OK) {
      throw new HttpException(res.errors, res.status);
    }

    return res.data;
  }

  @UseCache({ expiryTimer: 3600, useObjectAsKey: true })
  public async getCohortWiseDealerCount(
    filters: PartnerCohortFilters
  ): Promise<any> {
    const body: PartnerCohortCountBody = {
      filters,
      projections: PARTNER_COHORTS_PROJECTIONS,
    };
    const res = await this.getDealersCount(body);
    return res;
  }

  @UseCache({ expiryTimer: 1800, useObjectAsKey: true })
  public async getProductWiseMonthlyTrends(
    filters: ProductMonthlyAggregatesFilters
  ): Promise<any> {
    const body = {
      filters,
      projections: LOB_TREND_PROJECTIONS[filters.lob],
    };
    return this.getMonthlyTrends(body);
  }

  public async getTargets(body: SalesTargetsBody): Promise<any> {
    const options = {
      endpoint: process.env.API_CENTRAL_URL + `/v2/pos/targets`,
    };

    const res = await this.apiHelper.postData(options, body);

    if (res.status !== HttpStatus.OK) {
      throw new HttpException(res.errors, res.status);
    }
    return res.data;
  }

  @UseCache({ expiryTimer: 3600, useObjectAsKey: true })
  public async getOverallTargets(filters: SalesTargetsFilters): Promise<any> {
    const body: SalesTargetsBody = {
      filters,
      projections: TARGETS_PROJECTIONS,
    };

    return this.getTargets(body);
  }

  public async getSalesUserActivityList(body: any): Promise<any> {
    const requestBody = {
      ...body,
      projections: "employee_id, name, mobile, designation_id",
    };
    const options = {
      endpoint: `${process.env.API_CENTRAL_URL}/vymo/login/details`,
    };
    const response: any = await this.apiHelper.postData(options, requestBody);

    if (response?.status !== HttpStatus.OK) {
      throw new HttpException(
        response?.errors || "Error while fetching details",
        response.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    return response.data;
  }

  public async getSalesHierarchyAggregates(requestBody: any): Promise<any> {
    const options = {
      endpoint: process.env.API_CENTRAL_URL + `/v2/pos/aggregates/users`,
    };
    const res: any = await this.apiHelper.postData(options, requestBody);
    if (res.status !== HttpStatus.OK) {
      throw new HttpException(res.errors, res.status);
    }
    return res.data;
  }

  public async getCrossSellCustomersList(query: any): Promise<any> {
    const baseUrl = this.configService.get("API_CENTRAL_URL");
    const options = {
      endpoint: baseUrl + `/cross_sell/motor/list_customer`,
    };
    const res: any = await this.apiHelper.fetchData(options, query);
    if (res.status !== HttpStatus.OK) {
      throw new HttpException(res.errors, res.status);
    }
    return res.data;
  }

  public async getCrossSellDealersList(query: any): Promise<any> {
    const baseUrl = this.configService.get("API_CENTRAL_URL");
    const options = {
      endpoint: baseUrl + `/cross_sell/motor/list_dealer`,
    };
    const res: any = await this.apiHelper.fetchData(options, query);
    if (res.status !== HttpStatus.OK) {
      throw new HttpException(res.errors, res.status);
    }
    return res.data;
  }
}

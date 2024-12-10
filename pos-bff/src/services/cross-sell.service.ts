import { BadRequestException, Injectable } from "@nestjs/common";
import { HealthLeadMiddlewareService } from "./health-lmw.service";
import { MelorraScrapperService } from "./melorra-scrapper.service";
import { GetDealersListDto } from "../dtos/cross-sell/get-dealers.dto";
import DealerService from "./dealer-service";
import ApiPosService from "./apipos-service";
import MasterAPIService from "./master-service";
import { UseCache } from "../decorators/use-cache.decorator";

@Injectable()
export class CrossSellService {
  constructor(
    private readonly healthLmwService: HealthLeadMiddlewareService,
    private readonly melorraScrapperService: MelorraScrapperService,
    private readonly dealerService: DealerService,
    private readonly apiposService: ApiPosService,
    private readonly masterService: MasterAPIService
  ) {}

  async createHealthLead(params: any) {
    const dealerId = params.dealerId;
    const channelPartnerData = await this.dealerService.getDealersV2({
      dealer_id: dealerId,
    });
    if (!channelPartnerData?.length) {
      throw new BadRequestException("Dealer data not found");
    }
    const uuid = channelPartnerData?.[0]?.iam_uuid;
    const userDetails = await this.apiposService.fetchUserDetails(uuid);
    if (!userDetails) {
      throw new BadRequestException("User details not found");
    }
    const pincodeResponse = await this.masterService.getAreaDetailsByPinCode(
      params.pincode
    );
    const pincodeData = pincodeResponse?.[0];
    if (!pincodeData) {
      throw new BadRequestException("Pincode data not found");
    }
    const quoteData: any = {
      self: "1",
      self_age: params.age,
      // default gender male
      self_gender: params.gender || "Male",
    };
    if (params.insured_type === "2A") {
      quoteData.spouse = "1";
      // consider same age as self
      quoteData.spouse_age = params.age;
      quoteData.spouse_gender = quoteData.gender == "Male" ? "Female" : "Male";
    }
    const lmwRequestBody = {
      source: params.source,
      creatorType: "AGENT",
      sub_source: params.sub_source,
      medium: params.medium,
      details: {
        health_first_name: params.customer_name,
        pincode: params.pincode,
        city_name: pincodeData?.cityName,
        city_id: pincodeData?.cityId,
        state_name: pincodeData?.stateName,
        health_sum_insured: params.sum_assured,
        gender: quoteData.self_gender,
        existing_disease: {
          value: false,
        },
        plan_type: "base",
      },
      quote_data: quoteData,
      agent_id: userDetails.user_id,
      dealer_id: userDetails.dealer_id,
      is_portability_filter: false,
      dealer_name: userDetails.first_name,
      dealer_city: userDetails.dealer_city_id,
      parent_id: false,
      creatorIamId: params.creatorIamId,
      city_name: pincodeData?.cityName,
      state_id: pincodeData?.stateId,
      isCrossSell: true,
    };
    const leadData = await this.healthLmwService.addHealthLead(lmwRequestBody);
    return leadData?.result;
  }

  // @UseCache({ expiryTimer: 30 * 60 })
  public async getCustomers(dealerId: any): Promise<any> {
    const apiQueryParams = { dealer_id: dealerId };
    const customersData =
      await this.melorraScrapperService.getCrossSellCustomersList(
        apiQueryParams
      );

    const convertedCustomers = customersData?.customers?.filter(
      (customer: any) => customer?.is_converted
    );

    const nonConvertedCustomers = customersData?.customers?.filter(
      (customer: any) => !customer?.is_converted
    );

    const result = {
      ...customersData,
      customers: {
        converted: convertedCustomers,
        nonConverted: nonConvertedCustomers,
      },
    };
    return result;
  }

  // @UseCache({ expiryTimer: 30 * 60, useObjectAsKey: true })
  public async getDealers(
    query: GetDealersListDto,
    userUuid: string
  ): Promise<any> {
    const apiQueryParams: any = {
      rm_iam_uuid: userUuid,
      offset: query.offset || 0,
      limit: query.limit || 50,
    };

    if (query.dealerGcdCode) {
      apiQueryParams.dealer_gcd_code = query.dealerGcdCode;
    }

    if (query.dealerName) {
      apiQueryParams.dealer_name = query.dealerName;
    }

    const dealersList =
      await this.melorraScrapperService.getCrossSellDealersList(apiQueryParams);

    return dealersList;
  }
}

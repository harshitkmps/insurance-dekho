import { ScoreDetailsRes } from "../interfaces/ifm/score-details-response.interface";
import { Injectable, Logger } from "@nestjs/common";
import { UseCache } from "../decorators/use-cache.decorator";
import CommonApiHelper from "./helpers/common-api-helper";

@Injectable()
export default class IFMApiService {
  constructor(private apiHelper: CommonApiHelper) {}

  @UseCache({ expiryTimer: 1800 })
  public async getPointsData(
    domain: String,
    vehicleType: Number,
    vehicleSubType: Number,
    caseType: Number,
    policyType: Number,
    modeOfPayment: String,
    fuelType: String,
    make: Number,
    model: Number,
    variant: Number,
    vehicleCC: Number,
    seatingCapacity: Number,
    bookingMode: String,
    zeroOrNoDept: String,
    isNcb: String,
    vehicleUsageType: Number,
    ownerType: Number,
    registrationDate: String,
    manufacturingDate: String,
    policyBookingDate: String,
    paymentDate: String,
    policyIssueDate: String,
    rtoCode: String,
    gcdCode: String,
    channelType: Number,
    channelSubType: Number,
    fourthYearRenewal: Number,
    isRenewal: Number,
    tpTenure: number,
    cpaOptIn: boolean,
    grossWeight: number,
    vehicleSubUsageType: number | undefined | null,
    vehiclePermitUsageTypes: number | null,
    insurer: String,
    kitType: Number
  ): Promise<any> {
    try {
      const config = {
        params: {
          txnType: "payout",
          categoryType: "total,addendum,deviation",
          ruleView: "true",
        },
      };
      const options = {
        endpoint:
          process.env.IFM_ENDPOINT +
          "/orchestrate/v1/flow/best-matching-rules-flow",
        config,
      };
      const body = {
        domain,
        vehicleType,
        vehicleSubType,
        caseType,
        policyType,
        modeOfPayment,
        tpTenure,
        odTenure: 1,
        odDiscount: 0,
        ncb: 0,
        fuelType,
        make,
        model,
        variant,
        vehicleCC,
        seatingCapacity,
        bookingMode,
        zeroOrNoDept,
        isNcb,
        vehicleUsageType,
        ownerType,
        registrationDate,
        manufacturingDate,
        policyBookingDate,
        paymentDate,
        policyIssueDate,
        rtoCode,
        gcdCode,
        channelType,
        channelSubType,
        fourthYearRenewal,
        isRenewal,
        cpaOptIn,
        grossWeight,
        vehicleSubUsageType,
        vehiclePermitUsageTypes,
        insurer,
        kitType,
      };
      Logger.debug("IFM body request", { body });
      const scoreDetails: ScoreDetailsRes = await this.apiHelper.postData(
        options,
        body
      );
      Logger.debug("IFM score details API response", {
        options,
        scoreDetails,
      });
      return scoreDetails.data.body.details;
    } catch (err) {
      Logger.error("error in ifm service API hit", { err });
      const scoreDetails = [];
      return scoreDetails;
    }
  }

  public async getOttFromIfmGateway(mobile: string): Promise<string> {
    const options = {
      endpoint:
        process.env.API_IAM_PNL_MANAGER_ENDPOINT +
        "/iam/api/v1/user/auth/partner",
      config: {
        headers: {
          "x-api-key": process.env.IAM_PNL_MANAGER_X_API_KEY,
          "Content-Type": "application/json",
        },
        isResHeadersRequired: true,
      },
    };
    const body = {
      mobile,
      referenceAuthId: mobile,
    };

    Logger.debug("IFM IAM pnlManager ott request params", { body, options });
    const response: any = await this.apiHelper.postData(options, body);
    return response.headers["one-time-token"];
  }

  public async getAvailableScore(uuid: string): Promise<any> {
    const options = {
      endpoint: `${process.env.GRID_IFM_END_POINT}/view/v1/whatsapp/flow-id/atc?iam_uuid=${uuid}&feature=available-score`,
    };
    const response: any = await this.apiHelper.postData(options, {});
    return response?.data?.body;
  }
}

import { Inject, Injectable, Logger, forwardRef } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import { LeadMiddlewareService } from "../core/api-helpers/lead-middleware.service";
import ViewUtils from "../utils/view-utils";
import ContextHelper from "../services/helpers/context-helper";
import { Roles } from "../constants/roles.constants";
import KycService from "./kyc-service";
import DealerService from "./dealer-service";

@Injectable()
export default class MotorProposalService {
  constructor(
    private apiHelper: CommonApiHelper,
    private leadMiddlewareService: LeadMiddlewareService,
    @Inject(forwardRef(() => KycService))
    private kycService: KycService,
    private dealerService: DealerService
  ) {}

  public async prepareProposalSubmitParams(
    query: any,
    userInfo: any
  ): Promise<any> {
    const params = {
      dealer_id: userInfo?.refer_dealer_id || "",
    };
    const reqBody = {
      dealerId: query.dealerId,
      vehicleCategory: query.vehicleCategory,
    };
    const [rapDetails, agentChildDetails] = await Promise.all([
      userInfo?.refer_dealer_id && this.dealerService.getDealerDetails(params),
      this.dealerService.getAgentChildDetails(reqBody.dealerId, 1),
    ]);

    let masterGCDCode = "";
    let gcdCode = userInfo?.gcdCode;
    if (rapDetails?.length) {
      masterGCDCode = rapDetails[0].gcd_code;
    } else if (agentChildDetails?.length) {
      masterGCDCode = userInfo?.gcd_code;
      gcdCode = "";
    }
    const queryParams = {
      ...query,
      masterGCDCode,
      gcdCode,
      medium: ContextHelper.getStore().get("medium"),
      iamUuid: userInfo?.uuid ?? null,
    };
    return queryParams;
  }

  public async getMotorProposalInfo(
    queryParams: any,
    userInfo?: any
  ): Promise<any> {
    const proposalDetails =
      await this.leadMiddlewareService.getMotorProposalInfo(queryParams);
    // const updatedProposalDetails = this.maskProposalPii(proposalDetails);
    this.checkPolicyDocAccess(proposalDetails, userInfo?.pos_role_id);
    return proposalDetails;
  }

  public async updateMotorProposalDetails(params: any): Promise<any> {
    const options = {
      endpoint: process.env.API_LMW_ENDPOINT + `/api/v1/proposal`,
    };
    Logger.debug("motor proposal updation endpoint", { options, params });
    const leadDetailsResponseData: any = await this.apiHelper.postData(
      options,
      params
    );
    Logger.debug(
      "proposal updation response from LMW",
      leadDetailsResponseData
    );
    return leadDetailsResponseData.data;
  }

  public async getCommission(leadId: string, params: Object): Promise<any> {
    Logger.debug("fetching commission lmw", params);
    const options = {
      endpoint: `${process.env.API_LMW_ENDPOINT}/api/v1/lead/getCommission/${leadId}`,
    };
    const leadResponse: any = await this.apiHelper.fetchData(options, params);
    Logger.debug("lmw commission response", leadResponse);
    return leadResponse.data;
  }

  public async createLead(body: any): Promise<any> {
    const leadCreateBody = { ...body, currentState: "leadCreated" };
    return this.leadMiddlewareService.createLead(leadCreateBody);
  }

  public maskProposalPii(proposalDetails: any): any {
    const updatedProposalDetails = { ...proposalDetails };

    if (!updatedProposalDetails?.proposal) {
      return updatedProposalDetails;
    }
    const maskingFields = [
      "customer_mobile",
      "customer_email",
      "pan_card",
      "aadhaar_card",
      "vehicle_reg_address",
      "vehicle_reg_address2",
      "vehicle_reg_address3",
      "co_address",
      "co_address2",
      "co_address3",
      "co_pincode",
      "vehicle_reg_pincode",
      "reg_complete_address",
      "co_complete_address",
      "customer_pincode",
      "dob",
      "dob_ymd",
      "prev_policy_no",
    ];
    updatedProposalDetails.proposal = ViewUtils.maskFields(
      updatedProposalDetails.proposal,
      maskingFields
    );
    if (updatedProposalDetails?.lead?.kyc_details?.kycData) {
      this.kycService.maskKycDetails(updatedProposalDetails.lead.kyc_details);
    }

    return updatedProposalDetails;
  }

  public checkPolicyDocAccess(proposalDetails: any, roleId: number): any {
    const authorization = ContextHelper.getStore().get("authorization");
    if (
      (!authorization || Roles.POS_SALES_ALL.includes(roleId)) &&
      proposalDetails?.payment_summary
    ) {
      // remove policy doc links for non-logged in user
      proposalDetails.payment_summary.is_policy_download = false;
      proposalDetails.payment_summary.is_purchase_policy_download = false;
      proposalDetails.payment_summary.policy_link = "";
    }
  }

  public checkPypPolicyExpired(proposalDetails: any): any {
    if (proposalDetails?.lead) {
      const leadDetails = proposalDetails?.lead;
      const pypEndDate = new Date(leadDetails?.pyp_end_date).setHours(
        0,
        0,
        0,
        0
      );
      const today = new Date().setHours(0, 0, 0, 0);
      const leadType = leadDetails?.lead_type;
      if (leadType?.toLowerCase() === "rollover" && pypEndDate < today) {
        proposalDetails.lead.isPypExpired = true;
      }
    }
  }

  public checkValidRegistrationNumber(leadDetails: any) {
    if (leadDetails?.lead) {
      const regNo = leadDetails?.lead?.registration_number;
      if (
        regNo?.startsWith("DL") &&
        /^[A-Z]$/.test(regNo.charAt(3)) &&
        parseInt(regNo.charAt(2), 10) <= 9
      ) {
        leadDetails.lead.registration_number = "DL0" + regNo.substring(2);
      }
    }
  }
}

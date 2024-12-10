import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import { ConfigService } from "@nestjs/config";
import ContextHelper from "./helpers/context-helper";
import ViewUtils from "../utils/view-utils";
import { Roles } from "../constants/roles.constants";
import KycService from "./kyc-service";
import MasterAPIService from "./master-service";
import { HEALTH_BANK_DETAIL_FIELDS } from "../constants/master-data.constants";
import _ from "lodash";
import { BANK_ENCRYPTION_FIELDS } from "../constants/lmw.constants";
import EncryptionService from "./encryption-service";
import { HealthLeadMiddlewareService } from "./health-lmw.service";

@Injectable()
export default class HealthLeadService {
  private lmwEndpoint: string = "";
  private healthQmwEndpoint: string = "";

  constructor(
    private apiHelper: CommonApiHelper,
    private configService: ConfigService,
    private kycService: KycService,
    private masterService: MasterAPIService,
    private encryptionServce: EncryptionService,
    private healthLmwService: HealthLeadMiddlewareService
  ) {
    this.lmwEndpoint = this.configService.get("API_LMW_HEALTH_URL");
    this.healthQmwEndpoint = this.configService.get("API_QMW_HEALTH_URL");
  }

  public async submitHealthProposalPos(
    params: any,
    masterGCDCode: string,
    gcdCode: string
  ): Promise<any> {
    const options = {
      endpoint:
        process.env.API_LMW_ENDPOINT +
        `/api/v1/proposal/submit/${params.leadId}`,
    };
    Logger.debug("health proposal submission endpoint POS", {
      options,
      params,
    });
    const queryParams = {
      ...params,
      masterGCDCode,
      gcdCode,
    };
    const leadDetailsResponseData: any = await this.apiHelper.fetchData(
      options,
      queryParams
    );
    Logger.debug("proposal submission Response POS", leadDetailsResponseData);
    return leadDetailsResponseData.data;
  }

  public async getHealthProposalInfo(reqQuery: any, showScoreCard: any) {
    const queryParams = {
      ...reqQuery,
      showRewards: showScoreCard || false,
    };
    const options = {
      endpoint: process.env.API_LMW_ENDPOINT + `/api/v1/proposal`,
    };

    const leadDetails: any = await this.apiHelper.fetchData(
      options,
      queryParams
    );
    Logger.debug("proposal submission Response", leadDetails);
    return leadDetails.data;
  }

  public async submitHealthProposalApp(
    params: any,
    channelName: String,
    gcdCode: String,
    channelCity: String,
    channelType: String,
    channelSubType: String
  ): Promise<any> {
    const options = {
      endpoint:
        process.env.API_LMW_HEALTH_URL +
        `/health/proposer/send-final-proposal-details`,
    };
    Logger.debug("health proposal submission endpoint App", {
      options,
      params,
    });
    const body = {
      ...params,
      channelName,
      gcdCode,
      channelCity,
      channelType,
      channelSubType,
    };
    Logger.debug("request body health proposal submission", body);
    const leadDetailsResponseData: any = await this.apiHelper.postData(
      options,
      body
    );
    Logger.debug("proposal submission Response App", leadDetailsResponseData);
    return leadDetailsResponseData.result;
  }

  public async getCommission(params: Object): Promise<any> {
    Logger.debug("fetching commission lmw", params);
    const options = {
      endpoint: `${process.env.API_LMW_HEALTH_URL}/health/leads/getCommission`,
    };
    const leadResponse: any = await this.apiHelper.fetchData(options, params);
    Logger.debug("lmw commission response", leadResponse);
    return leadResponse.result;
  }

  public async getFusionMeetingSchedule(params: Object): Promise<any> {
    const options = {
      endpoint: `${process.env.API_LMW_HEALTH_URL}/health/leads/meeting/fetch-schedule`,
    };
    Logger.debug("get fusion meetings schedule API params", { params });
    const response: any = await this.apiHelper.fetchData(options, params);
    if (!response?.result) {
      return Logger.debug("empty get fusion meetings repsonse");
    }
    return response.result;
  }

  public async updateMeetingStatus(body: Object): Promise<any> {
    const options = {
      endpoint: `${process.env.API_LMW_HEALTH_URL}/health/leads/meeting/update-meeting-status`,
    };
    Logger.debug("update health meeting status API params", { body });
    const response: any = await this.apiHelper.postData(options, body);
    Logger.debug("response received from update health meeting status API");
    return response.result;
  }

  public async getFollowUpAvailableSlots(body: Object): Promise<any> {
    const options = {
      endpoint: `${process.env.API_LMW_HEALTH_URL}/health/leads/get-agent-followup-free-slots`,
    };
    Logger.debug("get followup available slots API params", { body });
    const response: any = await this.apiHelper.postData(options, body);
    Logger.debug("response received from get followup available slots API");
    return response.result;
  }

  public async sharePaymentLink(params: any): Promise<any> {
    const options = {
      endpoint:
        process.env.API_LMW_HEALTH_URL + "/health/leads/share-payment-details",
    };
    Logger.debug("health share payment details API params", { params });
    const response: any = await this.apiHelper.fetchData(options, params);
    Logger.debug("response received from health share payment URL");
    return response.result;
  }

  public checkPolicyDocAccess(policyDetails: any, roleId: number): any {
    const updatedPolicyDoc = { ...policyDetails };
    const authorization = ContextHelper.getStore().get("authorization");
    if (!authorization || Roles.POS_SALES_ALL.includes(roleId)) {
      updatedPolicyDoc.url = "";
      updatedPolicyDoc.policy_number = "";
      updatedPolicyDoc.file_name = "";
      updatedPolicyDoc.policy_number = "";
      updatedPolicyDoc.policy_booking_date = "";
      updatedPolicyDoc.policy_end_date = "";
      updatedPolicyDoc.policy_issue_date = "";
    }
    return updatedPolicyDoc;
  }

  public async getPolicyDoc(body: any): Promise<any> {
    const options = {
      endpoint: this.lmwEndpoint + "/health/policy/policy-doc-details",
    };
    const response: any = await this.apiHelper.postData(options, body);

    return response.result;
  }

  public async getPaymentDetails(body: any): Promise<any> {
    const options = {
      endpoint: this.lmwEndpoint + "/health/payment/payment-details",
    };
    const response: any = await this.apiHelper.postData(options, body);

    return response.result;
  }

  public checkPaymentDetailsAccess(
    paymentDetails: any,
    userInfo: any
  ): Promise<any> {
    const updatedPaymentDetails = { ...paymentDetails };
    // const maskedPaymentDetails = this.maskPaymentDetails(updatedPaymentDetails);

    if (updatedPaymentDetails?.groups?.[1]?.policy_details) {
      updatedPaymentDetails.groups[1].policy_details =
        this.checkPolicyDocAccess(
          updatedPaymentDetails.groups[1].policy_details,
          userInfo?.pos_role_id
        );
    }
    return updatedPaymentDetails;
  }

  public async getLeadDetails(body: any): Promise<any> {
    const options = {
      endpoint: this.healthQmwEndpoint + "/health/quotes/selected-lead-details",
    };
    const response: any = await this.apiHelper.fetchData(options, body);
    return response.result;
  }

  public async getMedicalDetails(body: any): Promise<any> {
    const options = {
      endpoint: this.lmwEndpoint + "/health/medical/get-medical-details",
    };
    const response: any = await this.apiHelper.postData(options, body);
    return response.result;
  }

  public maskLeadDetails(leadDetails: any, stage: string): any {
    const updatedLeadDetails = { ...leadDetails };
    if (stage === "paymentSummary") {
      updatedLeadDetails.email = updatedLeadDetails.email_masked;
      updatedLeadDetails.mobile = updatedLeadDetails.mobile_masked;
      this.maskCommunicationDetails(
        updatedLeadDetails.groups[1].communication_details
      );
      this.maskGroupDetails(updatedLeadDetails?.groups);
      if (updatedLeadDetails?.kyc_details?.kycData) {
        this.kycService.maskKycDetails(updatedLeadDetails.kyc_details);
      }
    }

    return updatedLeadDetails;
  }

  public maskPaymentDetails(paymentDetails: any): any {
    const updatedPaymentDetails = { ...paymentDetails };
    if (updatedPaymentDetails?.communication_details) {
      this.maskCommunicationDetails(
        updatedPaymentDetails.communication_details
      );
    }

    if (updatedPaymentDetails?.proposer_details) {
      this.maskProposerDetails(updatedPaymentDetails.proposer_details);
    }

    if (updatedPaymentDetails?.groups[1]) {
      this.maskGroupDetails(updatedPaymentDetails.groups);
    }

    return updatedPaymentDetails;
  }

  public maskProposerDetails(proposerDetails: any): any {
    proposerDetails.email = proposerDetails.email_masked;
    proposerDetails.mobile = proposerDetails.mobile_masked;
    proposerDetails.dob = ViewUtils.maskData(proposerDetails.dob);
    proposerDetails.pan_number = ViewUtils.maskData(proposerDetails.pan_number);
    proposerDetails.gst_number = ViewUtils.maskData(proposerDetails.gst_number);
    proposerDetails.aadhaar_number = ViewUtils.maskData(
      proposerDetails.aadhaar_number
    );
  }

  public maskCommunicationDetails(communicationDetails: any): any {
    communicationDetails.address_1 = ViewUtils.maskData(
      communicationDetails.address_1
    );
    communicationDetails.address_2 = ViewUtils.maskData(
      communicationDetails.address_2
    );
    communicationDetails.area = ViewUtils.maskData(communicationDetails.area);
    communicationDetails.pincode = ViewUtils.maskData(
      communicationDetails.pincode.toString()
    );
  }

  public maskGroupDetails(groups: any): any {
    for (const member of Object.values<any>(groups[1].member_details)) {
      member.dob = ViewUtils.maskData(member.dob);
    }

    if (groups[1].nominee_details) {
      groups[1].nominee_details.dob = ViewUtils.maskData(
        groups[1].nominee_details.dob
      );
      groups[1].nominee_details.address = ViewUtils.maskData(
        groups[1].nominee_details.address
      );
    }

    if (groups[1].visit_details) {
      groups[1].visit_details.dob = {
        date: "XX",
        month: "XX",
        year: groups[1].visit_details.dob.year,
      };
    }
  }

  public maskMedicalDetails(leadDetails: any, stage: string): any {
    const updatedLeadDetails = { ...leadDetails };
    if (stage.toLowerCase() === "checkout") {
      for (const question of updatedLeadDetails[1].questions) {
        for (const member of Object.values<any>(question.members)) {
          member.dob = ViewUtils.maskData(member.dob);
        }
        if (question.child_questions?.length) {
          for (const childQuestion of question.child_questions) {
            for (const member of Object.values<any>(childQuestion.members)) {
              member.dob = ViewUtils.maskData(member.dob);
            }
          }
        }
      }
    }
    return updatedLeadDetails;
  }

  public async saveNomineeDetails(body: any): Promise<any> {
    if (body?.isRenewal) {
      const lmwReqBody = { ...body };
      const res = await this.healthLmwService.saveNomineeDetails(lmwReqBody);
      return res;
    }

    const processedData = await this.processProposalData(body);
    const res = await this.healthLmwService.saveNomineeDetails(processedData);
    return res;
  }

  public async saveCommunicationDetails(body: any): Promise<any> {
    const processedData = await this.processProposalData(body);
    const res = await this.healthLmwService.saveCommunicationDetails(
      processedData
    );
    return res;
  }

  public async processProposalData(body: any): Promise<any> {
    try {
      const { bankDetailsRequired } = await this.validateBankDetails(
        body.planData,
        body.bankDetails
      );

      const lmwReqBody = { ...body };

      if (!bankDetailsRequired) {
        delete lmwReqBody.bankDetails;
        return lmwReqBody;
      }

      const bankDetails = { ...body.bankDetails };

      const kycResponse = await this.processBankDetailsForHealthKyc(
        bankDetails,
        body
      );

      lmwReqBody.bank_details_id = kycResponse.bankDetailsId;
      delete lmwReqBody.bankDetails;
      delete lmwReqBody.planData;

      return lmwReqBody;
    } catch (error) {
      Logger.error("Error in Proposal Data", error);
      throw error;
    }
  }

  public async processBankDetailsForHealthKyc(
    bankDetails: any,
    body: any
  ): Promise<any> {
    const encryptFields = _.pick(bankDetails, BANK_ENCRYPTION_FIELDS);
    const encryptBody = Object.values(encryptFields).filter(
      (field: string) => !field.includes("XXX")
    );
    // encrypt bank details
    const encryptedData = await this.encryptionServce.encrypt(encryptBody);
    let index = 0;
    for (const field in encryptFields) {
      if (bankDetails[field].includes("XXX")) {
        continue;
      }
      bankDetails[field] = encryptedData[index].ecrypted;
      bankDetails[`${field}_masked`] = encryptedData[index].masked;
      index++;
    }

    const kycBody = this.kycService.prepareBankKycDataForHealth(
      bankDetails,
      body
    );
    const kycResponse = await this.kycService.sendBankDetails(kycBody);

    return kycResponse;
  }

  public async validateBankDetails(
    planData: any,
    bankDetails: any
  ): Promise<any> {
    const masterApiParams = {
      limit: -1,
      isFormatData: 1,
      subProductTypeId: 4,
      masterType: "insurer",
      insurerPlan: JSON.stringify({
        [planData.insurer_slug]: planData.insurer_id,
      }),
    };
    const insurerValidationRules = await this.masterService.getMasterConfigData(
      "br2/insurer-master/masterData",
      masterApiParams,
      "GET"
    );

    const validationRules =
      insurerValidationRules?.[planData.insurer_slug]?.[planData.insurer_id]
        ?.insurers?.[0]?.validationRules;

    const errors = [];
    let bankDetailsRequired = false;

    for (const rule of validationRules) {
      if (HEALTH_BANK_DETAIL_FIELDS[rule.validationKey]) {
        bankDetailsRequired = true;
        if (
          bankDetails[rule.validationKey] &&
          bankDetails[rule.validationKey].includes("XXX")
        )
          continue;

        const pattern = rule.validationPattern;
        const isValid = new RegExp(pattern).test(
          bankDetails[rule.validationKey] || ""
        );
        if (!isValid) {
          errors.push(rule.validationKey);
        }
      }
    }

    if (errors?.length) {
      throw new BadRequestException(errors);
    }
    return { bankDetailsRequired };
  }
}

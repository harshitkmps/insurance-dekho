/* eslint-disable prettier/prettier */
import DealerService from "./dealer-service";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { ChannelPartnerSubTypes } from "../constants/channel-partners.constants";
import ConfigService from "./config-service";
import { config } from "../constants/config.constants";
import { NonAgentSalesRoles, PosRoles } from "../constants/pos-roles.constants";
import CommonApiHelper from "./helpers/common-api-helper";
import { buildCreateOfflineRequest } from "../dtos/mapper/offline";
import { DOCTYPE_LABEL_MAP, POLICY_TYPE } from "../constants/policy.constants";
import moment from "moment";
import CommonUtils from "../utils/common-utils";
import ApiBrokerageService from "./api-brokerage-service";
import MasterAPIService from "./master-service";
import DocumentService from "../core/api-helpers/document-service";
import DocumentServiceV2 from "./document-v2.service";
import ContextHelper from "./helpers/context-helper";
import ItmsService from "../core/api-helpers/itms-service";
import FormData from "form-data";
import {
  CASE_TYPE_LABEL_MAP,
  CASE_TYPE_MAP,
  INSPECTION_TYPES,
  ITMS_OFFLINE_STATUS,
  MOTOR_OFFLINE_DOC_SLUGS,
  MOTOR_OFFLINE_STATUS,
} from "../constants/itms.constants";
import {
  OFFLINE_INSPECTION_EXTENDED_TIMELINE,
  OFFLINE_INSPECTION_STATUS,
  OFFLINE_REQUEST,
} from "../constants/motor-offline.constants";
import {
  buildNavbar,
  buildRedirectionParams,
} from "../dtos/mapper/offline-navbar";
import TenantService from "./tenant-service";
import { ItmsCreateRequestInterface } from "../interfaces/offline/itms-create-request.interface";
import { buildProposalSummary } from "../dtos/mapper/offline-proposal-summary";
import {
  FETCH_DATA_VEHICLE_TYPE,
  BOOKING_RENEWAL_DAYS,
} from "../constants/quotes.constants";
import MotorUtils from "../utils/motor-utils";
import DateTimeUtils from "../utils/date-time-utils";
import { LeadMiddlewareService } from "../core/api-helpers/lead-middleware.service";
import { GetPolicyBookRatio } from "../interfaces/api-pos/get-policy-book-ratio.interface";
import ApiPosService from "./apipos-service";
import UtilityService from "./utility-service";

@Injectable()
export default class MotorOfflineService {
  constructor(
    private dealerService: DealerService,
    private configService: ConfigService,
    private apiHelper: CommonApiHelper,
    private apiBrokerageService: ApiBrokerageService,
    private masterService: MasterAPIService,
    private documentServiceV2: DocumentServiceV2,
    private documentService: DocumentService,
    private itmsService: ItmsService,
    private tenantService: TenantService,
    private leadMiddlewareService: LeadMiddlewareService,
    private apiPosService: ApiPosService,
    private utilityService: UtilityService
  ) {}

  public async autofillMmvDetails(
    requestBody: any,
    userInfo: any
  ): Promise<any> {
    const gcdCode = userInfo?.gcd_code;
    const tenantId = userInfo?.tenant_id;

    const autofillRes = {};

    const reqBody = {
      is_prime: 0,
      ...requestBody,
    };
    if (
      (userInfo.pos_role_id === PosRoles.Agent ||
        userInfo.pos_role_id === PosRoles.SubAgent) &&
      !gcdCode
    ) {
      Logger.debug("gcd code is empty. Therefore, mmv autofill is disabled", {
        pos_role_id: userInfo.pos_role_id,
        gcdCode,
      });
      return { autofillRes };
    }

    const autoFillEnableConfig = await this.configService.getConfigValueByKey(
      config.REGNO_AUTOFILL_CONFIG
    );

    if (!autoFillEnableConfig[tenantId || 1]) {
      Logger.debug("offline auto fill not configured for this tenant id ", {
        tenantId: tenantId || 1,
      });
      return { autofillRes };
    }

    const tenantUsersEligible = autoFillEnableConfig[tenantId || 1];
    if (!tenantUsersEligible.enabled) {
      Logger.debug("offline auto fill not enabled for this tenant id", {
        tenantId: tenantId || 1,
      });
      return { autofillRes };
    }

    const params =
      userInfo.pos_role_id === PosRoles.Agent ||
      userInfo.pos_role_id === PosRoles.SubAgent
        ? { dealer_id: userInfo.dealer_id }
        : null;
    const dealerDetails = params
      ? await this.dealerService.getDealerDetails(params)
      : [];

    if (params && !dealerDetails?.length) {
      Logger.debug("offline auto fill no dealer details found in CPS", {
        delaerId: userInfo.dealerId,
      });
      return { autofillRes };
    }

    if (tenantUsersEligible.allGcd) {
      if (
        !tenantUsersEligible.subAgent &&
        userInfo.pos_role_id === PosRoles.SubAgent
      ) {
        Logger.debug(
          "offline auto fill user does not meet the visibility criteria for sub-agent"
        );
        return { autofillRes };
      }

      if (
        (userInfo.pos_role_id === PosRoles.SubAgent ||
          userInfo.pos_role_id === PosRoles.Agent) &&
        !tenantUsersEligible.aggregator &&
        dealerDetails?.[0]?.channel_partner_sub_type ===
          ChannelPartnerSubTypes.AGGREGATOR
      ) {
        Logger.debug(
          "offline auto fill user does not meet the visibility criteria for aggregator"
        );
        return { autofillRes };
      }

      if (!tenantUsersEligible.rap && userInfo?.refer_dealer_id) {
        Logger.debug(
          "offline auto fill user does not meet the visibility criteria for rap"
        );
        return { autofillRes };
      }
      Logger.debug("all criteria met by user for allGcd", {
        gcdCode,
        allGcd: tenantUsersEligible.allGcd,
      });
      const autoFillResponse = await this.fetchRtoDataFromLmw(
        reqBody,
        userInfo.uuid
      );
      return {
        autofillRes: autoFillResponse?.data,
        message: autoFillResponse?.message,
        status: autoFillResponse?.status,
      };
    }
    // allGcd = false
    const gcdCodesForAutoFill = tenantUsersEligible.gcdCode;
    if (userInfo.pos_role_id === PosRoles.SubAgent) {
      Logger.debug("subagent logged in offline auto fill allGcd=false", {
        gcdCode,
      });
      return { autofillRes };
    }

    if (userInfo.refer_dealer_id) {
      Logger.debug(
        "offline auto fill user does not meet the visibility criteria for rap allGcd=false"
      );
      return { autofillRes };
    }

    if (
      (userInfo.pos_role_id === PosRoles.SubAgent ||
        userInfo.pos_role_id === PosRoles.Agent) &&
      dealerDetails?.[0]?.channel_partner_sub_type ===
        ChannelPartnerSubTypes.AGGREGATOR
    ) {
      Logger.debug(
        "offline auto fill user does not meet the visibility criteria for aggregator allGcd=false"
      );
      return { autofillRes };
    }

    if (gcdCode && gcdCodesForAutoFill.includes(gcdCode)) {
      Logger.debug("offline auto fill, allowed for this user", {
        gcdCode,
        allGcd: tenantUsersEligible.allGcd,
        tenantId,
      });
      const autoFillResponse = await this.fetchRtoDataFromLmw(
        reqBody,
        userInfo.uuid
      );
      // const preparedData = await this.prepareRtoData(autoFillResponse, regNo);
      return {
        autofillRes: autoFillResponse?.data,
        message: autoFillResponse?.message,
        status: autoFillResponse?.status,
      };
    }

    Logger.debug("offline auto fill, user does not satisfy any condition", {
      gcdCode,
      allGcd: tenantUsersEligible.allGcd,
      tenantId,
    });
    return { autofillRes };
  }

  public async fetchRtoDataFromLmw(reqBody: any, uuid: string): Promise<any> {
    const { fetchRtoData } = await this.shouldFetchFromRto(
      uuid,
      reqBody.product
    );
    if (!fetchRtoData) {
      return {};
    }
    const updatedBody = {
      ...reqBody,
      medium: ContextHelper.getStore().get("medium"),
    };
    const mmvAutoFillResponse = await this.leadMiddlewareService.getRtoDetails(
      updatedBody
    );
    const regNo = reqBody?.reg_no;
    const preparedData = await this.prepareRtoData(mmvAutoFillResponse, regNo);
    return preparedData;
  }

  public async shouldFetchFromRto(uuid: string, product: string): Promise<any> {
    const query: GetPolicyBookRatio = {
      uuid,
    };

    const [bookRatio, { configValue }] = await Promise.all([
      this.apiPosService.getPolicyBookRatio(query),
      this.utilityService.getConfig(config.POS_LEAD_TO_POLICY_CONVERSION),
    ]);

    const totalLeads = bookRatio[product].leads;
    const policies = bookRatio[product].policies;
    if (!totalLeads) {
      // no leads created
      return { fetchRtoData: true, error: null };
    }

    const threshold = configValue[product]?.thresholdValue;
    const conversionPercent = (policies * 100) / totalLeads;

    if (conversionPercent < threshold) {
      const ratio = threshold / 100;
      const policiesToBook = Math.max(
        Math.round((ratio * totalLeads - policies) / (1 - ratio)),
        1
      );

      const errorMsg = `Vaahan is currently disabled because the quote to booking ratio has dropped below the required level. To turn on the autofill feature again, please book ${policiesToBook} more policies. Please proceed to book manually`;
      return { fetchRtoData: false, error: errorMsg };
    }

    return { fetchRtoData: true, error: null };
  }

  public async prepareRtoData(autoDBData: any, regNo: string): Promise<any> {
    let returnData: any = {};
    if (!autoDBData?.data) {
      const message = `Vehicle details not available for ${regNo}`;
      returnData = { error_message: message };
      return returnData;
    }

    const autoDBResponseData = autoDBData.data;

    returnData = {
      registration_number: autoDBResponseData.registration_number || "",
      rto_code: autoDBResponseData.rto_code || "",
      registration_date: autoDBResponseData.registration_date || "",
      registration_year: autoDBResponseData.registration_year
        ? parseInt(autoDBResponseData.registration_year)
        : 0,
      manufacturing_date: autoDBResponseData.manufacturing_date || "",
      manufacturing_year: autoDBResponseData.manufacturing_year
        ? parseInt(autoDBResponseData.manufacturing_year)
        : 0,
      fuel_type: autoDBResponseData.fuel_type || "",
      make_id: autoDBResponseData.make_id || "",
      make_name: autoDBResponseData.make_name || "",
      model_id: autoDBResponseData.model_id || "",
      variant_id: autoDBResponseData.variant_id || "",
      model_name: autoDBResponseData.model_name || "",
      variant_name: autoDBResponseData.variant_name || "",
      cc: autoDBResponseData.cc,
      policy_number: "",
      insurer_id: autoDBResponseData.insurer_id ?? "",
      insurer_name: autoDBResponseData.insurer_name ?? "",
      customer_type: "I",
      first_name: "",
      last_name: "",
      customer_name: "",
      mobile: "",
      kitValue: 0,
      isCngLpgKit: 0,
      kitType: "",
      dealer_id: "",
      dealer_cityid: "",
      isRenewal: 0,
      policyEndDate: "",
      ncbDiscountPer: 0,
      autoDbPolicyType: "",
      policy_type: "",
      warning_message: "",
      isExpired: 0,
      vehicle_category: autoDBResponseData.vehicle_category?.toLowerCase(),
    };

    const insuranceDetail = autoDBResponseData.insurance_detail || {};
    const policyData = insuranceDetail.policy_data || {};

    returnData.policy_number = insuranceDetail.policy_number || "";
    if (policyData?.insurer_id) {
      returnData.insurer_id = policyData.insurer_id;
      returnData.insurer_name = policyData.insurerNameTrimmed;
    }

    returnData.autoDb_customer_type = policyData.customer_type || "";
    if (returnData.autoDb_customer_type.toLowerCase() === "company") {
      returnData.customer_type = "O";
    }

    const customerDetails = policyData.customerDetails || {};
    returnData.first_name = customerDetails.first_name || "";
    returnData.last_name = customerDetails.last_name || "";
    returnData.customer_name =
      `${returnData.first_name} ${returnData.last_name}`.trim();
    returnData.mobile = customerDetails.mobile || "";

    const vehicleDetails =
      (policyData.vehicleDetails && policyData.vehicleDetails[0]) || {};
    returnData.kitValue = vehicleDetails.kitValue || 0;
    returnData.isCngLpgKit =
      vehicleDetails.isCngLpgKit && vehicleDetails.isCngLpgKit === 1 ? 1 : 0;
    returnData.kitType =
      (vehicleDetails.kitType && vehicleDetails.kitType.toLowerCase()) || "";
    if (
      returnData.isCngLpgKit === 1 &&
      returnData.kitType === "externally fitted"
    ) {
      returnData.fuel_type = "ExternalCNG";
    } else if (
      returnData.isCngLpgKit === 1 &&
      returnData.kitType === "company fitted"
    ) {
      returnData.fuel_type = "CNG_LPG";
    }

    const dealerDetail = policyData.dealerDetail || {};
    returnData.dealer_id = dealerDetail.id || "";
    returnData.dealer_cityid = dealerDetail.cityid || "";

    returnData.isRenewal =
      policyData.isRenewal && policyData.isRenewal === 1 ? 1 : 0;
    returnData.policyEndDate =
      policyData?.policyEndDate || autoDBResponseData.insurance_upto || "";
    returnData.ncbDiscountPer = policyData.ncbDiscountPer || 0;
    returnData.autoDbPolicyType = policyData.policyType || "";
    if (returnData.autoDbPolicyType.trim() !== "") {
      const ptArr = returnData.autoDbPolicyType.split(" ");
      returnData.policy_type = ptArr[0].toLowerCase();
    }

    if (returnData.policyEndDate) {
      const expDateDiff = DateTimeUtils.getDaysDifference(
        new Date(),
        returnData.policyEndDate,
        "days"
      );
      if (expDateDiff > BOOKING_RENEWAL_DAYS) {
        returnData.warning_message = `${returnData.policy_type} policy is already active for this registration number.`;
      } else if (expDateDiff < 0) {
        returnData.isExpired = 1;
      }
    }

    return returnData;
  }

  public async uploadFileFromLink(reqBody: any, fileUrl: string): Promise<any> {
    const options = {
      endpoint: fileUrl,
      config: {
        responseType: "arraybuffer",
      },
    };
    const fileStream: any = await this.apiHelper.fetchData(options, {});
    const formData = new FormData();
    const document_name = fileUrl.split("/").pop();

    formData.append("file_name", fileStream, document_name + `.pdf`);

    for (const key in reqBody) {
      if (key !== "file_name" && key != "userInfo") {
        const value = reqBody[key];
        formData.append(key, value);
      }
    }

    const headers = formData.getHeaders();

    const response = await this.itmsService.uploadDocument(formData, headers);

    return response;
  }

  public async uploadDocFromZigChatLink(
    reqBody: any,
    authToken: any
  ): Promise<any> {
    try {
      const { file_name } = reqBody;
      let mimetypeFile = "";
      const options = {
        endpoint: file_name,
        config: {
          responseType: "arraybuffer",
        },
      };
      const fileStream: any = await this.apiHelper.fetchData(options, {});
      const originalname = file_name.split("/").pop();
      const fileType = originalname.split(".").pop();
      if (fileType === "png") {
        mimetypeFile = "image/png";
      } else if (fileType === "pdf") {
        mimetypeFile = "application/pdf";
      } else {
        mimetypeFile = "image/jpeg";
      }
      const docObject: any = {
        encoding: "7bit",
        fieldname: "file",
        buffer: {
          type: "Buffer",
          data: Array.from(fileStream),
        },
        originalname,
        mimetype: mimetypeFile,
        size: fileStream?.length,
      };
      const docServiceData: any = await this.documentServiceV2.uploadDoc(
        docObject,
        authToken
      );
      const itmsObject = {
        product_id: parseInt(reqBody?.product_id),
        document_reupload: parseInt(reqBody?.document_reupload),
        doc_name: reqBody?.doc_name,
        doc_type: reqBody?.doc_type,
        ticket_mapping_id: reqBody?.ticket_mapping_id,
        doc_id: docServiceData?.data?.doc_id,
        is_latest: parseInt(reqBody?.is_latest),
      };
      const response = await this.itmsService.updateProposalDoc(itmsObject);
      return response;
    } catch (error) {
      Logger.error("Document upload failed", error);
      throw new HttpException(
        "Error while Uploading Document :",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async getOfflineConfig(userInfo: any): Promise<any> {
    const configData = await this.configService.getConfigValueByKey(
      config.MOTOR_OFFLINE
    );

    const result = {
      requestOffline: true,
      submitPolicy: true,
    };

    result.requestOffline = this.checkIsFlowEnabled(
      userInfo,
      configData.requestOffline
    );

    result.submitPolicy = this.checkIsFlowEnabled(
      userInfo,
      configData.submitPolicy
    );

    return result;
  }

  public checkIsFlowEnabled(userInfo: any, config: any): boolean {
    if (!config?.enabled) {
      // config not enabled, hence flow not enabled
      return false;
    }

    if (!config?.conditions?.length) {
      // no conditions, show for everyone
      return true;
    }

    return this.configService.checkConditions(config.conditions, userInfo);
  }

  public async createOfflineRequest(reqBody: any, userInfo: any): Promise<any> {
    const context = ContextHelper.getStore();
    const queryParams = {
      requestSource: context.get("medium"),
    };
    const promises = [
      this.tenantService.getTenantDetailsFromMaster(userInfo, queryParams),
    ];
    if (!NonAgentSalesRoles.includes(userInfo.pos_role_id)) {
      promises.push(
        this.dealerService.getDealerDetails({
          iam_uuid: reqBody.vehicleDetails.dealerId,
        })
      );
    } else {
      promises.push(null);
    }

    if (
      !reqBody.vehicleDetails.makeModelVariant &&
      !reqBody.vehicleDetails.variant?.version_id
    ) {
      const params: any = {
        fetchData: FETCH_DATA_VEHICLE_TYPE[reqBody.vehicleDetails.type],
        categoryId: reqBody.vehicleDetails.type,
        fetchOnly: "all_make",
        versionId: reqBody.vehicleDetails.variant?.variantId,
      };
      if (reqBody.vehicleDetails.subType) {
        params.subCategoryId = reqBody.vehicleDetails.subType;
      }
      if (reqBody.vehicleDetails.insurerId) {
        params.insurer_id = reqBody.vehicleDetails.insurerId;
      }
      promises.push(
        this.masterService.getMasterConfigData(
          "br1/motor/getBkgMasterData",
          params,
          "GET"
        )
      );
    }

    const [tenantInfo, userDetails, variantList] = await Promise.all(promises);
    if (variantList?.length) {
      reqBody.vehicleDetails.variant = variantList[0];
    }
    const body: ItmsCreateRequestInterface = await buildCreateOfflineRequest(
      reqBody,
      userDetails,
      tenantInfo,
      userInfo
    );
    const res = await this.itmsService.createOfflineTicket(body);
    const ticketId = res?.data?.ticketUuid;
    if (
      reqBody.vehicleDetails?.offlineType === OFFLINE_REQUEST.DIRECT_ISSUANCE
    ) {
      reqBody.step = "directIssuance";
      await this.updateOfflineRequest(ticketId, reqBody);
      res.redirectToProposal = true;
    }
    Logger.debug("motor offline create response", { res });
    return res;
  }

  public async getOfflineRequest(ticketId: string, query: any) {
    const step = query?.step;
    const inspectionDetails = query?.inspectionDetails;
    const itmsResponse: any = await this.itmsService.getOfflineDetails(
      ticketId
    );
    const response = itmsResponse?.data;
    const transformedResponse = await this.transformPolicyDetails(response);
    const navBar = await buildNavbar(response?.statusId);
    const redirectionParams = await buildRedirectionParams(
      response?.statusId,
      step
    );
    const offlineResponse = {
      ...transformedResponse,
      navBar,
      redirectionParams,
    };
    const params = {
      kycStatus: response?.kycStatus,
      paymentMode: response?.paymentMode[0],
      isPaymentLinkExpired: response?.isPaymentLinkExpired,
      statusName: response?.statusName,
    };
    await this.updateInsurerLogo(offlineResponse);
    offlineResponse["proposalSummaryDetails"] = await buildProposalSummary(
      response?.ticketId,
      params
    );
    if (inspectionDetails === "true") {
      offlineResponse["inspectionDetails"] = await this.buildInspectionDetails(
        response?.ticketId,
        response?.inspectionId,
        response?.inspectionType
      );
    }
    return offlineResponse;
  }

  public async buildInspectionDetails(
    ticketId: string,
    inspectionId: string,
    inspectionType: number
  ) {
    try {
      const history: any = await this.getOfflineRequestHistory(ticketId);
      const historyData = history?.data ?? [];
      const response = [];
      historyData.forEach((data) => {
        if (OFFLINE_INSPECTION_STATUS.includes(parseInt(data?.status_id))) {
          const inspectionData = {
            displayName: data?.status_label,
            /* helperText:
              ITMS_OFFLINE_STATUS[parseInt(data?.status_id)]
                ?.inspectionMessage ?? "", */
            created: moment(data?.created?.date).format(
              "ddd DD-MMM-YYYY, hh:mm A"
            ),
            template: data?.template,
            statusId: parseInt(data?.status_id),
            //isActive: 0,
          };
          response.push(inspectionData);
        }
      });
      response.sort(function (a, b) {
        return moment.utc(a.created).diff(moment.utc(b.created));
      });
      if (!response.length) {
        return null;
      }
      const currentStep = response.length;
      const latestStatusId = response.slice(-1)[0]["statusId"];
      response.slice(-1)[0]["helperText"] =
        ITMS_OFFLINE_STATUS[latestStatusId]?.inspectionMessage?.[
          inspectionType
        ] ??
        ITMS_OFFLINE_STATUS[latestStatusId]?.inspectionMessage ??
        "";

      const extendedTimeline =
        OFFLINE_INSPECTION_EXTENDED_TIMELINE[latestStatusId];
      extendedTimeline.map((x) => {
        if (
          INSPECTION_TYPES.SELF === inspectionId &&
          x?.displayName === "Inspection Completed"
        ) {
          x["showDocument"] = true;
          x["displayText"] =
            ITMS_OFFLINE_STATUS[
              MOTOR_OFFLINE_STATUS.INSPECTION_COMPLETED
            ].displayText;
        }
      });
      if (extendedTimeline) {
        response.push(...extendedTimeline);
      }
      //response.slice(-1)["isActive"] = 1
      return {
        currentStep,
        data: response,
      };
    } catch (error) {
      Logger.error("error while fetching/mapping inspection history ", error);
    }
  }

  public async transformPolicyDetails(data: any): Promise<any> {
    const res = { ...data };
    const caseType =
      parseInt(data.caseType) === CASE_TYPE_MAP.ROLLOVER_BREAKIN &&
      !data.within90Days
        ? CASE_TYPE_MAP.BREAKIN_GREATER_THAN_90_DAYS
        : data.caseType;
    res.businessName = CASE_TYPE_LABEL_MAP[caseType];
    res.policyName = POLICY_TYPE[data.policyType];
    if (data.quoteRequestType === OFFLINE_REQUEST.QUOTE_REQUEST) {
      res.selectedQuote = data.shared_quotes?.find(
        (quote: any) => quote.insurerId === data.insurerId
      );
      if (!res.selectedQuote) {
        res.selectedQuote = data.archived_quotes?.find(
          (quote: any) => quote.insurerId === data.insurerId
        );
      }
    } else if (
      data.quoteRequestType === OFFLINE_REQUEST.DIRECT_ISSUANCE &&
      data.shared_quotes?.length
    ) {
      res.selectedQuote = data.shared_quotes[0];
      res.selectedQuote.gibplInsurerId = data.gibpl_insurer_id;
    }
    res.transformedRegDate = data.registrationDate?.date
      ? moment(data.registrationDate.date).format("MMM, YYYY")
      : "N/A";
    res.transformedManufDate = data.manufacturingDate?.date
      ? moment(data.manufacturingDate.date).format("MMM, YYYY")
      : "N/A";
    res.pypExpDate = data.prePolicyExpDate
      ? moment(data.prePolicyExpDate).format("MMM, YYYY")
      : "N/A";
    res.transformedCustDOB = data.custDOB?.date
      ? moment(data.custDOB.date).format("d MMM, yyyy")
      : "N/A";
    res.transformedDateOfIncorp = data.dateOfIncorporation
      ? moment(data.dateOfIncorporation).format("d MMM, yyyy")
      : "N/A";
    res.selectedCityName = "";
    res.selectedStateName = "";
    if (data.custCity) {
      const params = {
        tags: "cityId,cityName,stateId,state.stateName",
        sortBy: "popularity",
        fetchData: "city",
        cityId: data.custCity,
      };
      const masterCityList = await this.apiBrokerageService.getMasterCityList(
        params
      );
      const selectedCityDetails = masterCityList?.length
        ? masterCityList[0]
        : {};
      res.selectedCityName = selectedCityDetails.cityName;
      res.selectedStateName = selectedCityDetails.state?.stateName;
    }
    res.primaryAddress = CommonUtils.buildAddress(
      res.custAddress,
      res.selectedCityName,
      res.selectedStateName,
      res.custPincode
    );
    res.custNomineeVal = CommonUtils.capitalizeFirstLetter(data.custNominee);
    res.offlineDocs = await this.groupOfflineDocuments(
      data.documents,
      data?.DocumentInvalidReason
    );
    const revisedQuoteData = data.ticketRemarks.find(
      (ticketInfo: any) => ticketInfo.type === "revisedQuote"
    );
    if (revisedQuoteData) {
      res.revisedQuoteData = revisedQuoteData;
      const competitiveQuote = res.offlineDocs.competitive_quotes.docs?.[0];
      res.revisedQuoteData.s3KeyName = competitiveQuote?.s3KeyName;
      res.revisedQuoteData.isImage = competitiveQuote?.isImage;
      delete res.offlineDocs.competitive_quotes;
    }
    delete res.documents;
    return res;
  }

  private async updateInsurerLogo(offlineResponse) {
    try {
      const list: any = await this.masterService.getMasterDataForInsurers(
        "motor"
      );
      const insurerLogo = list?.insurers?.find(
        ({ insurerId }) => insurerId === offlineResponse?.gibplInsurerId
      )?.insurerLogo;
      if (insurerLogo) {
        offlineResponse["insurerLogo"] = insurerLogo;
      }
    } catch (error) {
      Logger.error("Error while adding insurer logo in motor offline", error);
    }
  }

  public async groupOfflineDocuments(
    documents: any[],
    invalidReasons: any
  ): Promise<any> {
    const groupedDocsList = {};

    const docIds = documents.map((doc: any) => doc.docUrlId).filter(Boolean);
    if (docIds?.length) {
      const headers = {
        authorization: ContextHelper.getStore().get("authorization"),
      };
      const docsList = await this.documentService.addRegisterDocumentV2(
        headers,
        docIds
      );

      for (const virtualDoc of docsList?.data?.docs) {
        const docIndex = documents.findIndex(
          (doc: any) => doc.docUrlId === virtualDoc.reference_id
        );
        const originalDoc = documents[docIndex];
        if (docIndex === -1) {
          continue;
        }
        const docLink = `${process.env.DOC_SERVICE_URL}doc-service/v1/documents/${virtualDoc.access_id}`;
        documents[docIndex].s3KeyName = docLink;
        documents[docIndex].isImage = CommonUtils.isImage(
          virtualDoc.file_extension
        );
        const errors =
          invalidReasons?.[originalDoc.docType]?.[originalDoc.lebelName];
        let errorString = null;
        if (errors) {
          errorString =
            (errors?.reasons ?? "Invalid Document") +
            `${
              errors?.subReasons?.length
                ? " - " + errors?.subReasons?.toString()
                : ""
            }`;
        }
        documents[docIndex].error = errorString;
      }
    }

    for (const doc of documents) {
      if (!DOCTYPE_LABEL_MAP[doc.docType]) {
        // no valid label found for doc type
        continue;
      }
      if (doc.docId === -1) {
        // no doc uploaded yet
        continue;
      }
      if (!groupedDocsList[doc.docType]) {
        groupedDocsList[doc.docType] = {
          heading: DOCTYPE_LABEL_MAP[doc.docType],
          docs: [],
        };
      }
      groupedDocsList[doc.docType].docs.push(doc);
    }
    return groupedDocsList;
  }

  public async updateOfflineRequest(id: string, body: any) {
    const itmsRequest = await this.buildUpdateOfflineRequest(id, body);
    const offlineUpdateResponse = await this.itmsService.updateOfflineTicket(
      id,
      itmsRequest
    );
    Logger.debug("motor offline update ticket response", {
      offlineUpdateResponse,
    });
    return offlineUpdateResponse;
  }

  public async generateCommunication(body: any) {
    const step = body?.step;
    const message: any = {};
    if (step === "sharePaymentLink") {
      const paymentLink = body.link ?? "";
      const amount = body.amount ?? "";
      const insurerName = body.insurer ?? "";
      const name = body.name;
      const paymentExpiry = body.paymentExpiry
        ? moment(body.paymentExpiry).format("YYYY-MM-DD hh:mm:ss")
        : "";

      const { url } = await this.itmsService.shortenUrl(paymentLink);
      const text = `Dear ${name}, following is the link to make payment of Rs. ${amount} to get your vehicle insured with ${insurerName}. ${
        paymentExpiry ? `Link expires at ${paymentExpiry}` : ""
      } ${url ?? ""}`;
      message.text = text;
      message.url = url;
    }
    return message;
  }

  private async buildUpdateOfflineRequest(id: string, body: any) {
    const updateRequestStepwiseConfig = {
      directIssuance: async () =>
        this.buildUpdateRequestForDirectIssuance(id, body),
      uploadPaymentReceipt: async () => this.buildPaymentDocReceipt(id, body),
      documents: async () => this.buildDocsUpdateReq(id, body),
      revisePaymentLink: async () => this.buildRevisePaymentLink(id, body),
      updateInspectionDetails: async () =>
        this.updateInspectionDetails(id, body),
      requestQuote: async () => this.buildQuoteRequestedReq(),
      proposalSummaryOwnerDetails: async () =>
        this.buildUpdateRequestForProposalSummaryOwnerDetails(id, body),
      proposalSummaryNomineeDetails: async () =>
        this.buildUpdateRequestForProposalSummaryNomineeDetails(id, body),
      proposalSummaryCompanyDetails: async () =>
        this.buildProposalSummaryCompanyDetailUpdateReq(id, body),
      requestRevisedQuote: async () => this.buildReviseQuoteReq(id, body),
      pushQuote: async () => this.buildRequestForPushSelectedQuote(id, body),
      proposalOwnerDetails: async () =>
        this.buildUpdateRequestForProposalOwnerDetails(id, body),
      proposalNomineeDetails: async () =>
        this.buildUpdateRequestForProposalNomineeDetails(body),
      chequeDetails: async () =>
        this.buildUpdateRequestForChequeDetails(id, body),
      proposalVehicleDetails: async () =>
        this.buildUpdateRequestForVehicleDetails(id, body),
      proposalDocs: async () => this.buildProposalDocsUpdateReq(id, body),
      selfInspection: async () => this.buildSelfInspectionRequest(id, body),
    };
    const request = (await updateRequestStepwiseConfig[body?.step]?.()) ?? {};
    return request;
  }

  private async buildPaymentDocReceipt(ticketId: string, body: any) {
    const request = {
      status_id: MOTOR_OFFLINE_STATUS.PAYMENT_DONE,
    };
    const updateDocBody = {
      productId: 1,
      docs: [
        {
          docType: MOTOR_OFFLINE_DOC_SLUGS.PAYMENT_RECIEPT,
          lebelName: "Page 1",
          docId: body.docId,
        },
      ],
    };
    await this.updateProposalDocs(ticketId, updateDocBody);
    return request;
  }

  private async buildRevisePaymentLink(ticketId: string, body: any) {
    const request = {
      status_id: MOTOR_OFFLINE_STATUS.PROPOSAL_RECEIVED,
      remarks: body?.remarks,
    };
    return request;
  }

  private async buildUpdateRequestForProposalSummaryOwnerDetails(
    ticketId: string,
    body: any
  ): Promise<any> {
    const request: any = {
      dont_update_status: true,
      status_id: MOTOR_OFFLINE_STATUS.PROPOSAL_RECEIVED,
    };

    const proposalData = {
      ticketId,
      owner_type: 1,
      mobile_no: body.custMobile,
      email_address: body.custEmail,
      gender: body.custGender,
      marital_status: body.custMaritalStatus,
      occupation: body.occupation,
      dob: body.dob,
    };
    request.proposal = proposalData;
    return request;
  }

  private async buildUpdateRequestForProposalSummaryNomineeDetails(
    ticketId: string,
    body: any
  ): Promise<any> {
    const request: any = {
      dont_update_status: true,
      status_id: MOTOR_OFFLINE_STATUS.PROPOSAL_RECEIVED,
    };

    const proposalData = {
      ticketId,
      owner_type: body.ownerType,
      nominee_name: body.custNominee,
      nominee_age: body.custNomineeAge,
      nominee_relation: body.custNomineeRelation,
      appointee_name: "",
      appointee_relation: "",
    };
    if (body.custNomineeAge < 18) {
      proposalData.appointee_name = body.appointeeName;
      proposalData.appointee_relation = body.appointeeRelation;
    }
    request.proposal = proposalData;
    return request;
  }

  public async updateProposalDocs(id: string, body: any): Promise<any> {
    const promises = [];
    for (const doc of body?.docs) {
      const params = {
        product_id: body.productId,
        document_reuploade: 1,
        doc_type: doc.docType,
        doc_name: doc.lebelName,
        ticket_mapping_id: id,
        is_valid: 1,
        is_latest: 1,
        doc_id: doc.docId,
      };
      promises.push(this.itmsService.updateProposalDoc(params));
    }
    const res = await Promise.all(promises);
    return res;
  }

  public async updatePreferredPlan(body: any): Promise<any> {
    const res = await this.itmsService.updatePreferredPlan(body);
    return res;
  }

  public async buildReviseQuoteReq(ticketId: string, body: any): Promise<any> {
    const request: any = {
      status_id: MOTOR_OFFLINE_STATUS.QUOTE_REQUESTED,
      remarks: body.remarks ?? "",
      type: "revisedQuote",
    };
    const updateDocBody = {
      productId: 1,
      docs: [
        {
          docType: "competitive_quotes",
          lebelName: "Page 1",
          docId: body.docId,
        },
      ],
    };

    const updatePreferedPlanBody = {
      ticketId: body?.ticketId,
      preferred: [
        {
          remark: body?.remarks ?? "",
          insurers: [body?.insurer],
          idv: body?.preferredIdv,
          addons: body?.addOns?.map((addOn) => addOn.name),
        },
      ],
    };

    await this.updateProposalDocs(ticketId, updateDocBody);
    await this.updatePreferredPlan(updatePreferedPlanBody);
    return request;
  }

  private async buildRequestForPushSelectedQuote(
    ticketId: string,
    body: any
  ): Promise<any> {
    const request: any = {
      dont_update_status: true,
      status_id: MOTOR_OFFLINE_STATUS.PROPOSAL_RECEIVED,
      selected_quotes_id: body.selectedQuoteId,
    };
    return request;
  }

  private async buildUpdateRequestForProposalOwnerDetails(
    ticketId: string,
    body: any
  ): Promise<any> {
    const request: any = {
      dont_update_status: true,
      status_id: MOTOR_OFFLINE_STATUS.PROPOSAL_RECEIVED,
      vehicle: {
        registration_no: body.vehicleRegNo,
      },
    };

    const areaDetails = await this.masterService.getAreaDetailsByPinCode(
      body.pincode
    );

    const proposalData: any = {
      owner_type: body.isCompanyCar ? 2 : 1,
      mobile_no: body.mobile.trim(),
      email_address: body.email,
      pincode: Number(body.pincode),
      city: areaDetails[0].cityId,
      state: areaDetails[0].stateId,
      full_name: body.fullName ?? body.companyName,
      address_same_as_rc: body?.addressSwitch ? 1 : 0,
    };
    if (!body.addressSwitch) {
      proposalData.address = body.address1;
      proposalData.address2 = body.address2 ?? "";
    }
    const moreDetail: any = {
      dateOfIncorporation: body.isCompanyCar ? body.dateOfIncorporation : "",
      serviceTaxNumber: body.isCompanyCar ? body.gstin : "",
    };
    const kycDetails: any = {
      ovd_details: {
        kycId: body.kycDetails?.ovdDetails?.kycId,
        mode: "ovd",
        kycCode: body.kycDetails?.ovdDetails?.kycCode,
        kycStatus: body.kycDetails?.ovdDetails?.kycStatus,
        kycDocuments: [
          {
            docId: body.panCard,
            identifierId: 1,
          },
          {
            docId: body[`${body.selectedOption}front`],
            identifierId: body.kycDetails?.kycOvdDocs?.[1]?.master_id,
          },
        ],
      },
    };
    if (body[`${body.selectedOption}back`]) {
      kycDetails.ovd_details.kycDocuments.push({
        docId: body[`${body.selectedOption}back`],
        identifierId: body.kycDetails?.kycOvdDocs?.[1]?.master_id,
      });
    }
    if (body.isCompanyCar) {
      kycDetails.ckyc_details = {
        kycId: body.kycDetails?.ckycDetails?.kycId,
        mode: "ckyc",
        kycCode: body.kycDetails?.ckycDetails?.kycCode,
        kycStatus: body.kycDetails?.ckycDetails?.kycStatus,
        kycDocuments: [
          {
            identifierId: body.kycDetails?.ckycDocs?.gstin_number.masterId,
            identifierValue: body.gstin,
          },
          {
            identifierId:
              body.kycDetails?.ckycDocs?.date_of_incorporation.masterId,
            identifierValue: body.dateOfIncorporation,
          },
          {
            identifierId: body.kycDetails?.ckycDocs?.company_name.masterId,
            identifierValue: body.companyName,
          },
        ],
      };
    } else {
      proposalData.gender = body.gender;
      proposalData.marital_status = body.maritalStatus;
      proposalData.occupation = body?.occupation;
      proposalData.dob = body.dob;
    }

    request.proposal = proposalData;
    request.moreDetail = moreDetail;
    request.kyc_details = kycDetails;
    Logger.debug(
      `request prepared for updating proposal owner details ${ticketId}`,
      request
    );
    return request;
  }

  private async buildUpdateRequestForProposalNomineeDetails(
    body: any
  ): Promise<any> {
    const request: any = {
      dont_update_status: true,
      status_id: MOTOR_OFFLINE_STATUS.PROPOSAL_RECEIVED,
    };

    const proposalData: any = {
      owner_type: 1,
      nominee_name: body.nomineeName,
      nominee_age: Number(body.nomineeAge),
      nominee_relation: body.nomineeRelation,
      appointee_name: "",
      appointee_relation: "",
    };

    if (Number(body.nomineeAge) < 18) {
      proposalData.appointee_name = body.appointeeName;
      proposalData.appointee_relation = body.appointeeRelation;
    }
    request.proposal = proposalData;
    return request;
  }

  private async buildUpdateRequestForChequeDetails(
    ticketId: string,
    body: any
  ): Promise<any> {
    const request: any = {
      dont_update_status: true,
      status_id: MOTOR_OFFLINE_STATUS.PROPOSAL_RECEIVED,
    };

    const paymentData: any = {
      payment_mode: "cheque",
      branch_name: body.branchName,
      cheque_in_favour: body.chequeInFavour,
      cheque_no: body.chequeNo,
      issuing_bank: body.bankName,
      issurance_date: body.issuanceDate,
    };

    if (body.chequeDoc) {
      const updateDocBody = {
        productId: 1,
        docs: [
          {
            docType: "cheque_copy",
            lebelName: "Page 1",
            docId: body.chequeDoc,
          },
        ],
      };
      await this.updateProposalDocs(ticketId, updateDocBody);
    }

    request.payment = paymentData;
    return request;
  }

  private async buildUpdateRequestForVehicleDetails(
    ticketId: string,
    body: any
  ): Promise<any> {
    const request: any = {
      status_id: MOTOR_OFFLINE_STATUS.PROPOSAL_RECEIVED,
    };

    if (
      body.caseType !== CASE_TYPE_MAP.NEW ||
      body.requestType === OFFLINE_REQUEST.DIRECT_ISSUANCE
    ) {
      request.dont_update_status = true;
    }

    request.payment = {
      payment_mode: body.paymentMode,
    };

    const moreDetails: any = {
      chassisNo: body.chasisNo,
      engineNo: body.engineNo,
      carFinanced: body.carFinanced ? 1 : 0,
      prePolicyNumber: body.prevPolicyNo,
      prePolicyInsurerId: body.previousInsurer,
      financeCompany: "",
      financeCompanyName: "",
    };

    if (body.carFinanced) {
      if (!body.isFinanceText) {
        moreDetails.financeCompany = body.financeCompanyId;
        moreDetails.financeCompanyName = body.financeCompany;
      } else {
        moreDetails.financeCompany = "other";
        moreDetails.financeCompanyName = body.financeCompanyText;
      }
    }

    if (body.financeCompanyDoc) {
      const updateDocBody = {
        productId: 1,
        docs: [
          {
            docType: "finance_company",
            lebelName: "Page 1",
            docId: body.financeCompanyDoc,
          },
        ],
      };
      await this.updateProposalDocs(ticketId, updateDocBody);
    }
    request.moreDetail = moreDetails;
    return request;
  }

  private async updateInspectionDetails(ticketId: string, body: any) {
    const request: any = {};
    const { inspectionType } = body;
    if (inspectionType === "third-party") {
      request.status_id = MOTOR_OFFLINE_STATUS.INSPECTION_REQUESTED;
      const customer: any = {
        first_name: body?.customerName,
      };
      const inspection: any = {
        inspectionType: 0,
      };
      customer.city = body?.city; //send case dealer id if possible
      customer.mobile = body?.contactNumber.trim() ?? "";
      customer.state = body?.state;
      inspection.inspectionPincode = body?.pincode ?? "";
      inspection.inspectionCity = body?.city;
      inspection.inspection_address_same_as_rc = body?.rcCheck ? 1 : 0;
      if (!body?.rcCheck) {
        inspection.inspectionAddress =
          body?.addressLine1 + " " + body?.addressLine2;
      }
      request.inspection = inspection;
      request.agencyId = parseInt(body?.preferredAgency);
      request.inspectPreferredTime1 = moment(
        body?.preferredDateTime
      ).toISOString();
      request.customer = customer;
      request.inspection = inspection;
    }
    if (inspectionType === "self") {
      const customer = {
        mobile: body?.contactNumber.trim() ?? "",
      };
      request.inspectionType = 1;
      request.customer = customer;
      request.agencyId = parseInt(body?.preferredAgency);
      request.status_id = MOTOR_OFFLINE_STATUS.INSPECTION_REQUESTED;
    }
    if (inspectionType === "already-inspected") {
      const updateDocBody = {
        productId: 1,
        docs: [
          {
            docType: MOTOR_OFFLINE_DOC_SLUGS.INSPECTION_REPORT,
            lebelName: "Page 1",
            docId: body.file,
          },
        ],
      };
      request.inspection = {
        agencyId: parseInt(body?.preferredAgency),
        inspectionType: 2,
      };
      await this.updateProposalDocs(ticketId, updateDocBody);
      request.status_id = MOTOR_OFFLINE_STATUS.INSPECTION_COMPLETED;
    }
    return request;
  }

  private async buildQuoteRequestedReq(): Promise<any> {
    const request: any = {
      status_id: MOTOR_OFFLINE_STATUS.QUOTE_REQUESTED,
    };
    return request;
  }

  public async buildProposalDocsUpdateReq(ticketId: string, body: any) {
    const request: any = {
      status_id: body?.isInspectionRequired
        ? MOTOR_OFFLINE_STATUS.PROPOSAL_PENDING
        : MOTOR_OFFLINE_STATUS.PROPOSAL_RECEIVED,
    };
    if (body.prevStatus) {
      request.status_id = body.prevStatus;
    }
    if (!body.docs?.length) {
      return request;
    }
    const updateDocBody = {
      productId: 1,
      docs: body.docs,
    };

    await this.updateProposalDocs(ticketId, updateDocBody);
    return request;
  }

  private async buildUpdateRequestForDirectIssuance(
    ticketId: string,
    body: any
  ) {
    const preferredInsurers = body.previousPolicyDetails?.preferredInsurers;
    if (!preferredInsurers?.length) {
      return;
    }
    const req = {
      status_id: MOTOR_OFFLINE_STATUS.PROPOSAL_PENDING,
    };
    const updateBody = {
      product_id: 1,
      document_reuploade: 1,
      doc_type: "",
      doc_name: "",
      ticketUuid: ticketId,
      is_valid: 1,
      is_latest: 1,
      docId: body.previousPolicyDetails.quoteDoc,
      totalDocs: 1,
      commonParameters: JSON.stringify({ medium: "POS", mode: "OFFLINE" }),
      premium: preferredInsurers[0].premium || "",
      addOns: JSON.stringify(
        preferredInsurers[0].addOns.map((addOn: any) => addOn.brokerage_id)
      ),
      idv: preferredInsurers[0].preferredIdv || "",
      gibpl_insurer_id:
        parseInt(body.vehicleDetails?.type) === 9
          ? body.vehicleDetails.insurerId
          : preferredInsurers[0].insurer?.[0]?.value,
      vehicleType: body.vehicleDetails?.type,
    };
    await this.itmsService.uploadSelectedQuote(updateBody);
    return req;
  }

  public async getOfflineDocuments(query: any) {
    Logger.debug(`fetching document details for ticketId ${query?.refId}`);
    const itmsResponse: any = await this.itmsService.getOfflineDocDetails(
      query
    );
    const offlineDocs = {};
    try {
      const docList = itmsResponse?.documents[0]?.child;
      if (!docList.length) {
        return { offlineDocs };
      }
      const docIds = [];
      for (const docType of docList) {
        for (const doc of docType.images) {
          if (doc.doc_id) {
            docIds.push(doc.doc_id);
          }
        }
      }
      let docResponse;
      if (docIds?.length) {
        const headers = {
          authorization: ContextHelper.getStore().get("authorization"),
        };
        docResponse = await this.documentService.addRegisterDocumentV2(
          headers,
          docIds
        );
      }
      for (const docType of docList) {
        const docs = docType.images;
        let isRequired = false;
        for (const doc of docs) {
          doc.docType = docType?.api_doc_name;
          if (doc.is_required) {
            isRequired = true;
          }
          const virtualDocInfo = docResponse?.data?.docs?.find(
            (virtualDoc: any) => virtualDoc.reference_id === doc.doc_id
          );
          if (!virtualDocInfo) {
            continue;
          }
          const docLink = `${process.env.DOC_SERVICE_URL}doc-service/v1/documents/${virtualDocInfo.access_id}`;
          doc.docUrl = docLink;
          doc.isImage = CommonUtils.isImage(virtualDocInfo.file_extension);
        }
        offlineDocs[docType?.api_doc_name] = {
          heading: docType?.category_name,
          isRequired,
          docs,
        };
      }
    } catch (error) {
      Logger.error(
        "error while fetching/mapping for ticketId " + query.refId,
        error
      );
    }
    return { offlineDocs };
  }

  public async getOfflineRequestHistory(ticketMappingId: string) {
    Logger.debug(`fetching inspection details for ticketId ${ticketMappingId}`);
    const itmsResponse = await this.itmsService.getHistory(ticketMappingId);
    return itmsResponse;
  }

  public async buildDocsUpdateReq(ticketId: string, body: any) {
    const request: any = {
      status_id: MOTOR_OFFLINE_STATUS.QUOTE_REQUESTED,
      dont_update_status: true,
    };
    if (!body.docs?.length) {
      return request;
    }
    const updateDocBody = {
      productId: 1,
      docs: body.docs,
    };

    await this.updateProposalDocs(ticketId, updateDocBody);
    return request;
  }

  private async buildProposalSummaryCompanyDetailUpdateReq(
    ticketId: string,
    body: any
  ): Promise<any> {
    const request: any = {
      dont_update_status: true,
      status_id: MOTOR_OFFLINE_STATUS.PROPOSAL_RECEIVED,
    };

    const proposalData = {
      ticketId,
      owner_type: 2,
      mobile_no: body.custMobile,
      email_address: body.custEmail,
    };
    request.proposal = proposalData;
    return request;
  }

  private async buildSelfInspectionRequest(ticketId: string, body: any) {
    const request: any = {
      status_id: MOTOR_OFFLINE_STATUS.INSPECTION_COMPLETED,
    };
    const updateDocBody = {
      productId: 1,
      docs: body.docs,
    };

    await this.updateProposalDocs(ticketId, updateDocBody);
    return request;
  }

  public async validateRegNoTicketExists(
    body: any,
    userInfo: any
  ): Promise<any> {
    const result = {
      ticketExists: false,
      message: "",
    };
    const isValidRegNo = MotorUtils.isValidRegNumber(body.regNo);
    if (!isValidRegNo) {
      return result;
    }
    let dealerId = userInfo.dealer_id;
    if (
      userInfo?.pos_role_id !== PosRoles.Agent &&
      userInfo?.pos_role_id !== PosRoles.SubAgent
    ) {
      dealerId = body.dealerId;
    }
    const params = {
      dealer_id: dealerId,
      registration_no: body.regNo,
    };
    const tickets = await this.itmsService.getActiveTicketsOnRegNo(params);
    const uniqueTickets = tickets.filter(
      (ticket: any) => ticket.ticketUuid !== body.ticketId
    );
    if (!uniqueTickets?.length) {
      return result;
    }
    result.message =
      "We have already received quote request with entered registration number. Please search for the same to get updates.";
    result.ticketExists = true;

    return result;
  }
}

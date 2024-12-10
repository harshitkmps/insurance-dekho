import { HttpException, Injectable, Logger } from "@nestjs/common";
import {
  ALTERNATE_INSURER_DISABLED_FIELDS,
  HIDE_EDIT_DETAILS_BASED_ON_LMW_STATUS,
  INSPECTION_RECOMMENDED_DISABLED_FIELDS,
  RENEWAL_DISABLED_FIELDS,
  VEHICLE_CATEGORY_MAPPING,
  VEHICLE_CATEGORY_MAPPING_FOR_QUOTES,
} from "../constants/motor-online.constants";
import CommonApiHelper from "./helpers/common-api-helper";
import ConfigService from "./config-service";
import MasterAPIService from "./master-service";
import ApiBrokerageService from "./api-brokerage-service";
import { config } from "../constants/config.constants";
import {
  mapKycHeadersWithData,
  modifyInsurerKycSortingOrder,
} from "../utils/kyc-utils";
import DocumentService from "../core/api-helpers/document-service";
import LsqService from "./lsq-service";
import DealerService from "./dealer-service";
import ContextHelper from "../services/helpers/context-helper";
import { UseCache } from "../decorators/use-cache.decorator";
import MotorOfflineService from "./motor-offline-service";
import { LeadMiddlewareService } from "../core/api-helpers/lead-middleware.service";
import moment from "moment";
import { PosInternalRoles } from "../constants/pos-roles.constants";
import TenantService from "./tenant-service";
import QuotesService from "./quotes-service";
import CommonUtils from "../utils/common-utils";
import { AddAlternateQuotesBody } from "../interfaces/lead-middleware/add-alternate-quotes.interface";

@Injectable()
export default class MotorOnlineService {
  constructor(
    private apiHelper: CommonApiHelper,
    private configService: ConfigService,
    private masterApiService: MasterAPIService,
    private apiBrokerageService: ApiBrokerageService,
    private documentService: DocumentService,
    private lsqService: LsqService,
    private dealerService: DealerService,
    private motorOfflineService: MotorOfflineService,
    private leadMiddlewareService: LeadMiddlewareService,
    private tenantService: TenantService,
    private quoteService: QuotesService
  ) {}

  public async getDataFromLM(
    medium: any,
    leadId: any,
    leadStage: any,
    isFetchZoopData = false,
    uuid?: string,
    isRenewalOfflineSummaryPage = false
  ): Promise<any> {
    try {
      const params: any = {
        leadId,
        stage: leadStage,
        medium,
        isRenewalOfflineSummaryPage,
      };
      if (isFetchZoopData) {
        if (uuid) {
          const { fetchRtoData } =
            await this.motorOfflineService.shouldFetchFromRto(
              uuid,
              "motorOnline"
            );
          if (!fetchRtoData) {
            // throw new ForbiddenException(error);
            params.regNumber = isFetchZoopData; // store reg number in a new field
            isFetchZoopData = false;
          }
        }
        params.isFetchZoopData = isFetchZoopData;
        params.isUpdateRegNumberInLead = true;
      }

      const options = {
        endpoint: process.env.API_LMW_ENDPOINT + `/api/v1/proposal`,
      };
      Logger.debug("motor online lead details from POS", { options });
      const leadDetailsResponseData: any = await this.apiHelper.fetchData(
        options,
        params
      );
      return leadDetailsResponseData?.data;
    } catch (error) {
      Logger.error("error while fetching lead data from LM ", error);
      throw new HttpException(
        error?.response ?? "Unable to get data from LM",
        error.status
      );
    }
  }
  public async getAsyncQuotesData(body: any, headers: any): Promise<any> {
    try {
      const medium = this.getLeadMedium(headers);
      const options = {
        endpoint: `${process.env.API_QMW_ENDPOINT}/motor/${
          VEHICLE_CATEGORY_MAPPING_FOR_QUOTES[body.vehicleCategory]
        }?request_source=${medium}`,
        headers: headers,
      };
      Logger.debug(`Motor Async Quotes body request`, { options });
      const quotesData: any = await this.apiHelper.postData(options, body);
      Logger.debug(`Motor Async Quotes API Response`, {
        options,
        quotesData,
      });
      return quotesData;
    } catch (error) {
      Logger.error("error while fetching quotes from brokerage ", error);
      throw new HttpException(
        error?.response ?? "Unable to get asyncquotes data from QMW",
        error.status
      );
    }
  }

  public getLeadMedium(headers: any) {
    let medium = process.env.POS_MEDIUM;
    if (headers["x-forwarded-host"] === process.env.X_FORWARDED_POS_APP_HOST) {
      medium = process.env.APP_MEDIUM;
    }
    return medium;
  }

  @UseCache({ expiryTimer: 60 * 60 })
  public async getCashlessGaragesListOrCount(
    rtoCode: string,
    vehicleCategory: string,
    insurer: string,
    type: string
  ): Promise<any> {
    try {
      let options = {};
      if (type === "cashlessList") {
        options = {
          endpoint: `${process.env.API_B2C_END_POINT}/common/insurer-city-garage-list?rto_code=${rtoCode}&vehicle_category=${vehicleCategory}&insurer=${insurer}`,
        };
        Logger.debug("motor online cashless garages option", { options });
      } else if (type === "cashlessCount") {
        options = {
          endpoint: `${process.env.API_B2C_END_POINT}/insurerCityGarageCount?rto_code=${rtoCode}&vehicle_category=${vehicleCategory}`,
        };
      }
      const cashlessGaragesCountOrList: any = await this.apiHelper.fetchData(
        options,
        {}
      );
      return cashlessGaragesCountOrList?.data;
    } catch (error) {
      Logger.error("error while fetching garages list ", error);
      throw new HttpException(
        error?.response ?? "Unable to get cashless garages list or count",
        error.status
      );
    }
  }

  public async getVehicleUsageTypeList(): Promise<any> {
    try {
      const options = {
        endpoint:
          process.env.MASTER_API_BASE_URL +
          `/api/v1/cfwUsageTypeModel?select={"usageTypeCode":1,"usageType":1,"_id":0}`,
      };
      Logger.debug("motor online vehicle usage type list", { options });
      const vehicleUsageList: any = await this.apiHelper.fetchData(options, {});
      return vehicleUsageList?.data;
    } catch (error) {
      Logger.error("error while fetching vehicle usage type ", error);
      throw new HttpException(
        error?.response ?? "Unable to get vehicle usage type list",
        error.status
      );
    }
  }

  public async getBodyTypeList(categoryId: string): Promise<any> {
    try {
      const options = {
        endpoint:
          process.env.MASTER_API_BASE_URL +
          `/api/v1/motor/getBkgMasterData?fetchData=cfw_body_type&categoryId=${categoryId}&subCategoryId=&tags=bodyTypeCode,bodyType,status`,
      };
      Logger.debug("motor online vehicle usage type list", { options });
      const vehicleUsageList: any = await this.apiHelper.fetchData(options, {});
      return vehicleUsageList?.data;
    } catch (error) {
      Logger.error("error while fetching vehicle usage type ", error);
      throw new HttpException(
        error?.response ?? "Unable to get vehicle body type list",
        error.status
      );
    }
  }

  @UseCache({ expiryTimer: 60 * 60 })
  public async getMotorFilteredList(
    policyType: string,
    categoryId: string,
    registrationYear: string,
    source: string,
    subSource: string,
    businessType: string,
    isPrevPolicyExpiredBeforeNinetyDays: string
  ): Promise<any> {
    try {
      const options = {
        endpoint: `${process.env.MASTER_API_BASE_URL}/api/v1/common/quoteFilterMasters`,
      };
      const filteredPostData = {
        tags: "addOnsFilterMaster,ncbMaster,policyTypeMaster,idvFilterMaster,policyTenureMaster,claimSettlementMaster,prevPolicyTypeMaster,flexiDiscountFilterMaster",
        policyType,
        categoryId,
        registrationYear,
        source,
        subSource,
        businessType,
        isPrevPolicyExpiredBeforeNinetyDays,
      };
      Logger.debug(`Motor Async Quotes filter list`, { options });
      const filteredList: any = await this.apiHelper.postData(
        options,
        filteredPostData
      );
      return filteredList?.data;
    } catch (error) {
      Logger.error("error while fetching filter list from brokerage ", error);
      throw new HttpException(
        error?.response ?? "Unable to get motor filters list",
        error.status
      );
    }
  }

  public async getSharedQuoteList(shareQuoteId: string): Promise<any> {
    try {
      const options = {
        endpoint: `${process.env.API_LMW_ENDPOINT}/api/v1/shareQuote?shareQuoteId=${shareQuoteId}`,
      };
      Logger.debug("motor online shared quotes details from LMW", { options });
      const sharedQuotesResponse: any = await this.apiHelper.fetchData(
        options,
        {}
      );
      sharedQuotesResponse?.data?.quotes_data?.forEach((lead: any) => {
        lead?.quotes?.forEach((quote) => {
          delete quote.commissionData;
        });
      });
      return sharedQuotesResponse?.data;
    } catch (error) {
      Logger.error("error while fetching shared quote details from LMW", error);
      throw new HttpException(
        error?.response ?? "Unable to get shared quotes list",
        error.status
      );
    }
  }

  public async pushSelectedQuotes(
    vehicleCategory: string,
    body: any,
    userInfo: any
  ): Promise<any> {
    const selectQuoteResponse = await this.quoteService.pushMotorSelectedQuote(
      vehicleCategory,
      body
    );

    const isAlternateFlowEnabled = await this.checkAlternateFlowEligibility(
      userInfo
    );

    if (!isAlternateFlowEnabled) {
      return selectQuoteResponse;
    }

    await this.addAlternateQuotes(body);

    return selectQuoteResponse;
  }

  public async getSupportCategoryList(
    req: any,
    supportData: any
  ): Promise<any> {
    try {
      const { subSource, pageIds, status, subStatus } = req.query;
      const options = {
        endpoint:
          process.env.SUPPORT_API_URL +
          `/api/config/getTaskSupportTypeFromCategory?subSource=${subSource}&pageIds=${pageIds}&status=${status}&subStatus=${subStatus}`,
        config: {
          headers: {
            "x-auth-id": supportData.user_id,
            "x-auth-token": supportData.auth_token,
          },
        },
      };
      Logger.debug("motor online support category list from support", {
        options,
      });
      const supportCategoryList: any = await this.apiHelper.fetchData(
        options,
        {}
      );
      return supportCategoryList?.data;
    } catch (error) {
      Logger.error(
        "error while fetching support category list from Support ",
        error
      );
      throw new HttpException(
        error?.response ?? "Unable to get support category list",
        error.status
      );
    }
  }

  public async getSelfInspectionInfo(
    insurerId: string,
    vehicleType: string,
    policyCaseId: string
  ): Promise<any> {
    try {
      const options = {
        endpoint: `${process.env.API_MASTER_URL}/api/v1/motor/insurersMaster`,
        config: {
          headers: {
            "Content-Type": "application/json",
            "cache-control": "no-cache",
          },
        },
      };
      const postRequestData = {
        tags: ["selfInspectionRules"],
        insurerId,
        vehicleType,
        policyCaseId,
      };
      Logger.debug(`Motor Self Inspection Info`, { options });
      const selfInspectionList: any = await this.apiHelper.postData(
        options,
        postRequestData
      );
      return selfInspectionList?.data;
    } catch (error) {
      Logger.error(
        "error while fetching motor self inspection info from brokerage ",
        error
      );
      throw new HttpException(
        error?.response ?? "Unable to get self inspection info.",
        error.status
      );
    }
  }

  public async config(params: any): Promise<any> {
    const configData = {
      proposalJourneyEnabled: true,
      insurerMasterRules: null,
      kycConfig: null,
      kycHeaders: null,
      kycHeadersWithData: null,
      successMetrics: null,
      insurerTAT: null,
      disabledFields: null,
      hideEditDetailsCta: false,
    };
    const kycConfigParams = params.kycConfig;
    const kycConfigPromise =
      this.masterApiService.getKycConfig(kycConfigParams);

    const insurerRulesParams = params.insurerConfig;
    const insurerRulesPromise =
      this.apiBrokerageService.getInsurerMasterRules(insurerRulesParams);

    const { insurerId } = params.kycSortingOrder;

    const isRenewalCase = params.leadMiscDetails?.isRenewalQuote;
    const renewalDisabledFieldsParams = {
      ...insurerRulesParams,
      tags: "renewalDisabledFields",
    };
    const renewalDisabledFieldsPromise = isRenewalCase
      ? this.apiBrokerageService.getInsurerMasterRules(
          renewalDisabledFieldsParams
        )
      : Promise.resolve([]);

    const [
      kycSortingOrder,
      insurerMasterRules,
      kycConfig,
      insurerTATConfig,
      renewalDisabledFields,
    ] = await Promise.all([
      this.configService.getConfigValueByKey(config.KYC_SORTING_ORDER),
      insurerRulesPromise,
      kycConfigPromise,
      this.configService.getConfigValueByKey(
        config.KYC_INSURER_REDIRECTION_TAT
      ),
      renewalDisabledFieldsPromise,
    ]);
    const rtoCodeInitials = params.leadMiscDetails?.rtoCode?.slice(0, 2);
    if (insurerMasterRules?.[0]?.validationRules?.vehicleRegNo?.pattern) {
      insurerMasterRules[0].validationRules.vehicleRegNo.pattern =
        insurerMasterRules[0].validationRules.vehicleRegNo.pattern[
          rtoCodeInitials
        ]
          ? insurerMasterRules[0].validationRules.vehicleRegNo.pattern[
              rtoCodeInitials
            ]
          : insurerMasterRules[0].validationRules.vehicleRegNo.pattern.Default;
    }

    const insurerKycSortingOrderConfig = kycSortingOrder?.find(
      (obj) => obj["insurerId"] === insurerId
    );

    const insurerTAT = insurerTATConfig.find(
      (obj) => obj["insurerId"] === insurerId
    );

    const { modifiedInsurerKycSortingOrderConfig, successMetrics } =
      modifyInsurerKycSortingOrder(insurerKycSortingOrderConfig);

    const mappedKycHeadersWithData = mapKycHeadersWithData(kycConfig);

    let disabledFields =
      renewalDisabledFields?.[0]?.renewalDisabledFields ?? [];
    if (isRenewalCase) {
      disabledFields = [...disabledFields, ...RENEWAL_DISABLED_FIELDS];
    }
    const isAlternateInsurer = params.leadMiscDetails?.isAlternateInsurer;
    if (isAlternateInsurer) {
      disabledFields = [
        ...disabledFields,
        ...ALTERNATE_INSURER_DISABLED_FIELDS,
      ];
    }
    const isInspectionReportGenerated =
      params.leadMiscDetails?.inspectionReportDate;
    if (isInspectionReportGenerated) {
      disabledFields = [
        ...disabledFields,
        ...INSPECTION_RECOMMENDED_DISABLED_FIELDS,
      ];
    }
    const hideEditDetailsCta = HIDE_EDIT_DETAILS_BASED_ON_LMW_STATUS.includes(
      Number(params.leadMiscDetails?.status)
    );
    // const appendKycHeadersDataWithHeaders = null;  // check later if required

    disabledFields = [
      ...disabledFields,
      ...this.addMandatoryFieldsToDisabled(
        insurerMasterRules[0]?.validationRules
      ),
    ];
    configData.kycConfig = kycConfig;
    configData.insurerMasterRules = insurerMasterRules;
    configData.kycHeaders = modifiedInsurerKycSortingOrderConfig;
    configData.kycHeadersWithData = mappedKycHeadersWithData;
    configData.successMetrics = successMetrics;
    configData.insurerTAT = insurerTAT?.tat;
    configData.disabledFields = disabledFields;
    configData.hideEditDetailsCta = hideEditDetailsCta;

    return configData;
  }

  public addMandatoryFieldsToDisabled = (response) => {
    const disabledFields = [];

    Object.keys(response).forEach((key) => {
      if (response[key].isDisabled) {
        disabledFields.push(key);
      }
    });

    return disabledFields;
  };

  public async getAlternateQuotes(params: any): Promise<any> {
    try {
      const options = {
        endpoint:
          process.env.API_LMW_ENDPOINT + `/api/v1/inspection/alternate-insurer`,
      };
      Logger.debug("getting alternate quotes motor online", {
        options,
      });
      const response: any = await this.apiHelper.fetchData(options, params);
      return response?.data?.data;
    } catch (error) {
      Logger.error("error while getting alternate quotes", error);
      throw new HttpException(
        error?.httpCode || 500,
        error?.message ?? "Unable to get alternate quotes"
      );
    }
  }

  public async updateAlternateInsurerKyc(body: any): Promise<any> {
    try {
      const options = {
        endpoint: process.env.API_LMW_ENDPOINT + `/api/v1/update-kyc`,
      };
      const response: any = await this.apiHelper.postData(options, body);
      return response?.data;
    } catch (error) {
      Logger.error("error while updating kyc data to lmw", error);
      throw new HttpException(
        error?.status || 500,
        error?.response?.errors ?? "Unable to update kyc data"
      );
    }
  }

  public async updateLeadStatus(body: any): Promise<any> {
    try {
      const options = {
        endpoint: process.env.API_LMW_ENDPOINT + `/api/v1/lead`,
      };
      const response: any = await this.apiHelper.postData(options, body);
      return response?.data;
    } catch (error) {
      Logger.error("error while updating lead status", error);
      throw new HttpException(
        error?.httpCode || 500,
        error?.message ?? "Unable to update lead"
      );
    }
  }

  public async updateLeadStatusToLmw(body: any, leadId: any): Promise<any> {
    try {
      const options = {
        endpoint:
          process.env.API_LMW_ENDPOINT + `/api/v1/lead/updateStatus/${leadId}?`,
      };
      const response: any = await this.apiHelper.postData(options, body);
      return response;
    } catch (error) {
      Logger.error("error while updating Lead status to lmw", error);
      throw new HttpException(
        error?.httpCode || 500,
        error?.message ?? "Unable to update Lead Status"
      );
    }
  }

  public async updateLead(body: any): Promise<any> {
    const options = {
      endpoint: process.env.API_LMW_ENDPOINT + `/api/v1/proposal/v2`,
    };
    const response: any = await this.apiHelper.postData(options, body);
    return response?.data;
  }

  public async appendFilePathsToDocuments(documents): Promise<any> {
    const docIds = [];
    const updatedDocuments = [];
    if (documents?.length > 0) {
      documents.forEach((doc) => {
        if (doc?.doc_id) docIds.push(doc?.doc_id);
      });
      const addDocumentResponse =
        await this.documentService.addRegisterDocumentV2({}, docIds, false);
      const docUrls = [];
      if (addDocumentResponse?.data?.docs) {
        const docs = addDocumentResponse.data.docs;
        docs.forEach((doc) => {
          const accessId = doc?.access_id;
          const extension = doc?.file_extension;
          const docId = doc?.reference_id;
          docUrls.push({
            file: `${process.env.DOC_SERVICE_URL}doc-service/v1/documents/${accessId}`,
            ext: extension,
            doc_id: docId, // remove once lmw passes this
          });
        });
      }
      documents.forEach((doc, index) => {
        updatedDocuments.push({
          ...doc,
          file: docUrls[index]?.file,
          extension: docUrls[index]?.ext,
          doc_id: docUrls[index]?.doc_id,
        });
      });
    }
    return updatedDocuments;
  }

  public async getProposalDocuments(leadId, isFilePath = false): Promise<any> {
    const options = {
      endpoint:
        process.env.API_LMW_ENDPOINT +
        `/api/v1/getDocuments/${leadId}?isFilePath=${isFilePath}`,
      method: "GET",
    };
    const response: any = await this.apiHelper.getData(options, {});
    const documents = response?.data?.documents;
    const updatedDocuments = await this.appendFilePathsToDocuments(documents);
    return updatedDocuments;
  }

  public async uploadProposalDocuments(uploadDocuments): Promise<any> {
    try {
      const options = {
        endpoint: process.env.API_LMW_ENDPOINT + `/api/v2/uploadDocuments`,
        method: "POST",
      };
      const response: any = await this.apiHelper.postData(
        options,
        uploadDocuments
      );
      return response;
    } catch (error) {
      Logger.error("error while uploading documents", error);
      throw new HttpException(
        error?.httpCode || 500,
        error?.message ?? "Unable to upload documents"
      );
    }
  }

  public async scheduleInspection(body): Promise<any> {
    const options = {
      endpoint: process.env.API_LMW_ENDPOINT + `/api/v1/inspection/schedule`,
      method: "POST",
    };
    const response: any = await this.apiHelper.getData(options, body);
    return response?.data;
  }

  public async getInspectionDetails(): Promise<any> {
    try {
      const options = {
        endpoint: process.env.API_LMW_ENDPOINT + `/api/v1/inspection/schedule`,
        method: "POST",
      };
      const response: any = await this.apiHelper.getData(options, {});
      return response?.data;
    } catch (error) {
      Logger.error("error while scheduling inspection", error);
      throw new HttpException(
        error?.httpCode || 500,
        error?.message ?? "Unable to schedule inspection"
      );
    }
  }

  public async checkInspectionStatus(params, headers): Promise<any> {
    try {
      const options = {
        endpoint:
          process.env.API_ITMS_ENDPOINT + `/checkIfInspectionProcessable`,
        method: "GET",
        headers,
      };
      const response: any = await this.apiHelper.getData(options, params);
      return response?.data;
    } catch (error) {
      Logger.error("error while fetching inspection statsus", error);
      throw new HttpException(
        error?.httpCode || 500,
        error?.message ?? "Error while fetching inspection statsus"
      );
    }
  }

  public async resendInspectionLink(params): Promise<any> {
    try {
      const { leadId, userId } = params;
      const medium = ContextHelper.getStore().get("medium");
      const options = {
        endpoint:
          process.env.API_LMW_ENDPOINT +
          `/api/v1/inspection/resend/${leadId}?userId=${userId}&medium=${medium}`,
        method: "GET",
      };
      const response: any = await this.apiHelper.getData(options, params);
      return response?.data;
    } catch (error) {
      Logger.error("error while resending inspection link", error);
      throw new HttpException(
        error?.httpCode || 500,
        error?.message ?? "error while resending inspection link"
      );
    }
  }

  public async checkCaseCreator(
    partnerUuid: string,
    loginUserUuid: string
  ): Promise<any> {
    try {
      let isSamePartner = false;
      if (loginUserUuid === partnerUuid) {
        isSamePartner = true;
      } else {
        const cpsDetails = await this.lsqService.getChannelPartnerDetails(
          partnerUuid
        );
        isSamePartner = this.loginUserExistInCPSHierarchy(
          cpsDetails,
          loginUserUuid
        );
      }

      return isSamePartner;
    } catch (error) {
      Logger.error("error while fetching cps deatils for given partner", error);
      throw new HttpException(
        error?.response ?? "Unable to get cps details",
        error?.status
      );
    }
  }

  public async downloadPolicy(params: any): Promise<any> {
    const response = await this.leadMiddlewareService.getPolicyLink(
      params.leadId,
      {
        type: params.docType,
        usePrevPolicyLink: true,
      }
    );
    if (response?.policy?.status === 1) {
      const docKey = params.docKey;
      const policyDocId = response?.policy?.[docKey];
      if (policyDocId) {
        const docIds = [policyDocId];
        const addDocumentResponse =
          await this.documentService.addRegisterDocumentV2({}, docIds, false);
        if (addDocumentResponse.data.docs) {
          const doc = addDocumentResponse.data.docs?.[0];
          const accessId = doc.access_id;
          const docUrl =
            process.env.DOC_SERVICE_URL +
            `doc-service/v1/documents/` +
            accessId;
          return docUrl;
        }
      } else {
        const policyDocUrl = response?.policy?.policyDocUrl;
        return policyDocUrl;
      }
    }
    return response;
  }
  public async redirectToNewProposalPage(params): Promise<any> {
    try {
      const redirectionConfig = await this.configService.getConfigValueByKey(
        config.NEW_PROPOSAL_PAGE_REDIRECTION_CONFIG
      );
      if (redirectionConfig?.disableNewJourney) {
        return false;
      }
      const { dealerId, gcdCode, isRenewal } = params;

      if (isRenewal === "1" && redirectionConfig?.disableJourneyForRenewal) {
        return false;
      }
      if (redirectionConfig?.enableForAll) {
        return true;
      }

      const gcdCodes = redirectionConfig?.gcdCodes;
      if (gcdCodes?.indexOf(gcdCode) !== -1) {
        return true;
      }
      const dealerIds = redirectionConfig?.dealerIds;
      if (dealerIds?.indexOf(dealerId) !== -1) {
        return true;
      }
      if (redirectionConfig?.enableCityWiseNewJourney) {
        const cpsParams = {};
        if (dealerId) {
          cpsParams["dealer_id"] = dealerId;
        }
        if (gcdCode) {
          cpsParams["gcd_code"] = gcdCode;
        }
        // if (leadId) {
        //   const leadDetails =
        //     await this.leadMiddlewareService.getMotorProposalInfo({ leadId });
        //   params["dealer_id"] = leadDetails?.lead?.user_detail?.dealer_id;
        // }

        let dealerInfo = await this.dealerService.getDealerDetails(cpsParams);

        if (dealerInfo?.data) dealerInfo = dealerInfo?.data;
        const cityId = dealerInfo?.[0]?.city_id;
        const cities = redirectionConfig?.cities;
        if (cities.indexOf(cityId) !== -1) {
          return true;
        }
      }
      return false;
    } catch (error) {
      Logger.error("error while redirection to proposal page new", error);
      return false;
    }
  }
  public loginUserExistInCPSHierarchy(
    cpsDetails: any,
    loginUserUuid: string
  ): boolean {
    const iamUuids = cpsDetails.flatMap((detail: any) =>
      Object.values(detail.sales_agents).flatMap((salesAgentArray: any) =>
        salesAgentArray.map((salesAgent: any) => salesAgent.iam_uuid)
      )
    );
    return iamUuids.includes(loginUserUuid);
  }

  public async quotesBasedOnCustomerType(body: any): Promise<any> {
    try {
      const options = {
        endpoint: `${process.env.API_QMW_ENDPOINT}/motor/${
          VEHICLE_CATEGORY_MAPPING[body.vehicleCategory]
        }/getQuotesBasedOnCustomerType`,
      };
      Logger.debug(`Motor Quotes Based on CustomerType body request`, {
        options,
      });
      const quotesData: any = await this.apiHelper.postData(options, body);
      Logger.debug(`Motor Quotes Based on CustomerType API Response`, {
        options,
        quotesData,
      });
      return quotesData;
    } catch (error) {
      Logger.error("error while fetching quotes from brokerage ", error);
      throw new HttpException(
        error?.response ?? "Unable to get quotes data from QMW",
        error.status
      );
    }
  }
  public async fetchMotorRenewalData(body: any): Promise<any> {
    try {
      const options = {
        endpoint:
          process.env.API_LMW_ENDPOINT + `/api/v1/getAllLeadByParamData`,
      };
      const response: any = await this.apiHelper.fetchData(options, body);
      return response.data;
    } catch (error) {
      Logger.error("error while redirection to motor LMW", error);
      return false;
    }
  }

  public async createMotorLeadRequest(
    userInfo: any,
    reqBody: any
  ): Promise<any> {
    const queryParams = {
      requestSource: ContextHelper.getStore().get("medium"),
    };

    const tenantInfo = await this.tenantService.getTenantDetailsFromMaster(
      userInfo,
      queryParams
    );

    if (!tenantInfo) {
      throw new Error("Tenant details could not be retrieved.");
    }

    const userDetails = { ...tenantInfo, ...userInfo };
    const isalesUser = PosInternalRoles.includes(userInfo?.pos_role_id);

    const motorLeadApiMapper = {
      GCV: async () =>
        this.buildGcvLeadRequest(reqBody, userDetails, isalesUser),
    };

    const body = await motorLeadApiMapper[reqBody?.vehicleType]?.();
    if (!body) throw new Error("Lead request body could not be created.");

    Logger.debug("Motor online leads request", body);
    const res = await this.leadMiddlewareService.createLead(body);
    Logger.debug("Motor online create lead response", res);

    return res;
  }

  private buildCommonLeadRequest(
    data: any,
    userDetails: any,
    isalesUser: boolean
  ) {
    return {
      medium: ContextHelper.getStore().get("medium"),
      request_medium: ContextHelper.getStore().get("medium"),
      mode: "ONLINE",
      userid: userDetails?.user_id,
      creatorIamId: userDetails?.uuid,
      dealer_id: isalesUser
        ? ContextHelper.getStore().get("cpsUser")?.dealer_id.toString()
        : userDetails?.dealer_id,
      user_detail: {
        user_id: userDetails?.user_id,
        is_qc_bypass: userDetails?.is_qc_bypass || 1,
        dealer_id: isalesUser
          ? ContextHelper.getStore().get("cpsUser")?.dealer_id.toString()
          : userDetails?.dealer_id,
        user_role_id: userDetails?.pos_role_id,
        dealer_city_id: isalesUser
          ? ContextHelper.getStore().get("cpsUser")?.city_id.toString()
          : userDetails?.dealer_city_id,
      },
      creatorType: userDetails?.roleName || "",
      is_sync_data: 0,
      customer_type: "I",
      source: userDetails?.source || "",
      sub_source: userDetails?.subSource || "",
      currentState: "leadCreated",
    };
  }

  private buildVehicleDateInfo(data: any, leadType: string) {
    const currentDate = moment();
    const nextDate = moment().add(1, "day");
    const registrationYear = data?.regYear;

    let registrationDate = moment()
      .year(registrationYear)
      .month(currentDate.month())
      .date(currentDate.date())
      .format("YYYY-MM-DD");

    let manufacturingDate = moment()
      .year(registrationYear)
      .month(currentDate.month())
      .date(1)
      .format("YYYY-MM-DD");

    let pypEndDate = data?.policyExpiryDate;

    if (nextDate.date() === 29 && nextDate.month() === 1) {
      nextDate.date(28);
    }

    if (leadType === "Rollover" && currentDate.year() === nextDate.year()) {
      registrationDate = moment()
        .year(registrationYear)
        .month(nextDate.month())
        .date(nextDate.date())
        .format("YYYY-MM-DD");
    } else if (leadType === "New") {
      manufacturingDate = registrationDate;
    } else if (leadType === "RolloverBreakIn") {
      registrationDate = manufacturingDate;
    }

    if (leadType === "Rollover") {
      pypEndDate = moment().add(7, "days").format("YYYY-MM-DD");
    }

    return {
      registration_year: registrationYear,
      registration_date: registrationDate,
      manufacturing_date: manufacturingDate,
      manufacturing_year: registrationYear,
      pyp_end_date: pypEndDate,
    };
  }

  private buildGcvLeadRequest(
    data: any,
    userDetails: any,
    isalesUser: boolean
  ) {
    const commonBody = this.buildCommonLeadRequest(
      data,
      userDetails,
      isalesUser
    );

    const leadType = this.determineLeadType(data);
    const dateInfo = this.buildVehicleDateInfo(data, leadType);

    return {
      ...commonBody,
      central_make_id: data?.make || "",
      central_model_id: data?.modelId.toString() || "",
      gvw: data?.gvw || 0,
      fuel_type: data?.fuelType || "",
      lead_type: leadType,
      registration_year: dateInfo.registration_year,
      registration_date: dateInfo.registration_date,
      manufacturing_date: dateInfo.manufacturing_date,
      pyp_end_date: dateInfo.pyp_end_date,
      vehicle_category: data?.vehicleCategoryId.toString() || "",
      vehicle_sub_category: data?.vehicleSubCategoryId.toString() || "",
      rto_code: data?.rtoCode || "",
      prev_ncb_percent: data?.prevNcbPercent || 0,
      isAssistanceEligible: data?.isAssistanceEligible || false,
      isAssistanceRequested: data?.isAssistanceRequested || false,
      leadTypeShort: "cv",
      isAnchorMaster: 1,
      central_version_id: data?.modelVariant || "",
      central_make_name: data?.makeName || "",
      central_model_name: data?.modelName || "",
      central_version_name: data?.versionName || "",
      cvInsurerId: data?.previousInsurerId || "",
      manufacturing_year: dateInfo.manufacturing_year,
      policy_exp_before_90_days: data?.isPolicyExpireGreaterThan90Days || 0,
      previous_insurer_id: data?.previousInsurerId || "",
      is_lpg_cng_kit: "0",
      kit_type: "",
      lpg_cng_kit_value: "0",
    };
  }

  private determineLeadType(data: any): string {
    const currentYear = new Date().getFullYear();
    if (data?.isPolicyExpireGreaterThan90Days === 1) {
      return "RolloverBreakIn";
    } else if (currentYear.toString() === data.regYear) {
      return "New";
    } else {
      return "Rollover";
    }
  }

  public async checkAlternateFlowEligibility(userInfo: any): Promise<any> {
    const configData = await this.configService.getConfigValueByKey(
      config.ALTERNATE_PROPOSAL_FLOW
    );

    if (!configData?.enabled) {
      return false;
    }

    const isEnabled = this.configService.checkConditions(
      configData?.conditions ?? [],
      userInfo
    );

    return isEnabled;
  }

  public async addAlternateQuotes(reqBody: any): Promise<any> {
    try {
      const body: AddAlternateQuotesBody = {
        leadId: reqBody.leadId,
      };
      const res = await this.leadMiddlewareService.addAlternateQuotes(body);
      return res;
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in adding alternate quotes", { error });
    }
  }
}

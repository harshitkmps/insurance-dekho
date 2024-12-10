import moment from "moment";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import {
  PostionOfNonGeneralProducts,
  BucketMapping,
  VehicleTypesVsLabel,
  CaseListingUrl,
  OldPosAppCaseListingUrl,
  OldPosCaseListingUrl,
  PremiumLabelMapping,
  itmsSubStatusVsSlug,
  CasesUpdates,
  PolicyMedium,
  posBaseUrl,
  VehicleTypes,
  posAppBaseUrl,
  RENEWAL_FOMO_DROP_MULTIPLIER,
  RENEWAL_FOMO_MISSED_END_DATE,
  LMW_PRODUCT_SLUGS,
  RENEWAL_FOMO_UPCOMING_END_DATE,
  REMOVE_DATE_RANGE_KEYS,
  SME_SLUGS_TO_NAME,
  RENEWAL_CASE_LISTING_CTA_TEXT,
} from "../constants/case-listing.constants";
import ContextHelper from "../services/helpers/context-helper";
import CommonApiHelper from "./helpers/common-api-helper";
import CommonUtils from "../utils/common-utils";
import { UseCache } from "../decorators/use-cache.decorator";
import { PosRoles } from "../constants/pos-roles.constants";
import MasterAPIService from "./master-service";
import ConfigService from "./config-service";
import { config } from "../constants/config.constants";
import { UserTable } from "../models/tbl-user.schema";
import { Guest } from "../models/guest.schema";
import {
  SME,
  WELLNESS,
  CAMEL_CASE_PRODUCT_TYPES,
} from "../constants/case-listing.constants";
import { MOTOR_ONLINE_STATUS } from "../constants/lmw.constants";
import EncryptionService from "./encryption-service";
import MotorOnlineService from "./motor-online-service";
import { MOTOR_OFFLINE_STATUS } from "../constants/itms.constants";
import { OFFLINE_REQUEST } from "../constants/motor-offline.constants";
import { InsurerData } from "../interfaces/master/master-data-response.interface";
import { RolesTable } from "../models/tbl-roles.schema";
import { config as fusionConfig } from "../constants/fusion.constants";
import DocumentService from "../core/api-helpers/document-service";
import ApiPosService from "./apipos-service";
import { GetPolicyDocLinkQueryDto } from "../dtos/caselisting/renewals.dto";
import { LeadMiddlewareService } from "../core/api-helpers/lead-middleware.service";

@Injectable()
export default class CaseListingService {
  constructor(
    private apiHelper: CommonApiHelper,
    private masterApiService: MasterAPIService,
    private configService: ConfigService,
    private encryptionService: EncryptionService,
    private motorOnlineService: MotorOnlineService,
    private documentService: DocumentService,
    private apiposService: ApiPosService,
    private leadMiddlewareService: LeadMiddlewareService
  ) {}

  public async fetchProducts(
    userInfo: any,
    data: object[],
    listType: any,
    referrer: string
  ): Promise<any> {
    try {
      Logger.debug("fetch products details userinfo", { userInfo });

      const caseListingProducts = await this.configService.getConfigValueByKey(
        config.CASE_LISTING_PRODUCTS
      );
      let generalProducts = caseListingProducts.general,
        nonGeneralProducts = caseListingProducts.nonGeneral;

      let tenantId = null;
      if (userInfo?.tenant_id) tenantId = userInfo?.tenant_id?.toString();

      if (
        tenantId &&
        caseListingProducts?.tenantId &&
        caseListingProducts?.tenantId[tenantId] != null &&
        caseListingProducts?.tenantId[tenantId] != undefined
      ) {
        generalProducts = caseListingProducts.tenantId[tenantId].general;
        nonGeneralProducts = caseListingProducts.tenantId[tenantId].nonGeneral;
      }

      generalProducts.map((product: any) => {
        if (
          listType !== "renewal" ||
          (product !== "Travel" &&
            product !== "Pet" &&
            product !== "Fire" &&
            product !== "SpecificMarine" &&
            // product !== "SME" &&
            product !== "Wellness" &&
            product !== "WorkmenCompensation" &&
            product !== "ProfessionalIndemnity" &&
            product !== "GroupHealth" &&
            product !== "Card")
        )
          data.push({ title: product });
      });

      const eligibleForLife =
        userInfo.pos_role_id !== 3 ||
        (userInfo.pos_role_id == 3 && userInfo.irda_id) ||
        userInfo?.eligible_for_life;

      if (nonGeneralProducts.length && eligibleForLife) {
        nonGeneralProducts.forEach((product: any) => {
          if (listType !== "renewal" || product !== "Life")
            data.splice(PostionOfNonGeneralProducts, 0, { title: product });
        });
      }

      if (referrer && referrer.includes(process.env.POS_URL)) {
        data = data.filter((product: any) => {
          return !process.env.NON_INSURANCE.includes(product.title);
        });
      }

      return data;
    } catch (error) {
      Logger.error(
        "error in fetching products in case listing skeleton",
        error
      );
      throw error;
    }
  }

  public async fetchFilters(products: any[], listType: any): Promise<any> {
    try {
      const caseListingProductFilters =
        await this.configService.getConfigValueByKey(
          listType !== "renewal"
            ? config.CASE_LISTING_PRODUCT_FILTERS
            : config.RENEWAL_PRODUCT_FILTERS
        );
      products.forEach((product) => {
        const filter = caseListingProductFilters[product?.title];
        product.filters = filter;
      });
    } catch (error) {
      Logger.debug("error in fetching filters in case listing skeleton", error);
      throw error;
    }
  }

  public async fetchProductsBaseUrl(products: any[]): Promise<any> {
    try {
      const caseListingProductFilters =
        await this.configService.getConfigValueByKey(
          config.CASE_LISTING_PRODUCTS_BASE_URLS
        );
      products.forEach((product) => {
        const filter = caseListingProductFilters[product?.title];
        product.baseUrl = filter;
      });
    } catch (error) {
      Logger.error("error in fetching filters in case listing skeleton", error);
      throw error;
    }
  }

  public async prepareCaseListingReqData(
    body: any,
    userInfo: any
  ): Promise<any> {
    const designationId = body.filters?.salesId?.designationId
      ? Number(body.filters.salesId.designationId)
      : null;
    const uuid = userInfo.uuid;
    if (!uuid) {
      throw new HttpException(
        "uuid not found in the system",
        HttpStatus.BAD_REQUEST
      );
    }
    const productForTeamWiseResults = body["productType"];
    const posRoleId = userInfo.pos_role_id;

    if (posRoleId === PosRoles.Agent) {
      body.filters.channelIamId = userInfo.uuid; //channelIamId
    } else if (posRoleId === PosRoles.SubAgent) {
      body.filters.creatorIamId = userInfo.uuid;
    } else if (posRoleId === PosRoles.Executive) {
      if (!body.filters.channelIamId) {
        body.filters.creatorIamId = userInfo.uuid;
      }
    } else {
      const userDetails = await this.getPosRoles();
      let user = null;
      if (designationId) {
        user = userDetails.find(
          (user: any) => user.designationId === designationId
        );
        body.filters.salesIamId = body.filters.salesId.subordinateId;
        body.filters.creator = user.name;
        delete body.filters.salesId;
      } else {
        user = userDetails.find(
          (user: any) => user.id === userInfo.pos_role_id
        );
        body.filters.salesIamId = userInfo.uuid;
      }
      const teamDetails =
        userInfo?.teams?.[productForTeamWiseResults?.toLowerCase()];
      if (teamDetails) {
        body.filters.teamUuid = teamDetails?.teamUuid;
        body.filters.level = teamDetails?.level;
      }

      Logger.debug("user name and designation in ID Tree", { user });
      if (posRoleId !== PosRoles.SuperAdmin && posRoleId !== PosRoles.Admin) {
        body.filters.creator = user.name;
      }
    }
    body.filters.bucket = BucketMapping[body.filters.bucket];
    body.filters.source = "ucd,saathi,agency,partner,enterprise";
    if (body.filters.channelIamId) {
      if (body.filters.creator && posRoleId === PosRoles.Agent)
        delete body.filters.creator;
    }
    if (body.filters.creator === "RH") {
      body.filters.creator = "SH";
    }
    if (body?.filters?.productType === "All") {
      delete body.filters.productType;
    }
    if (!body?.filters?.searchValue) {
      delete body.filters.searchValue;
    }
    if (!body?.filters?.policyNumber) {
      delete body.filters.policyNumber;
    }
    if (!body?.filters?.policyMedium || body?.filters?.policyMedium === "all") {
      delete body.filters.policyMedium;
    }
    if (body?.filters?.vehicleType === "0") {
      delete body?.filters?.vehicleType;
    }
    if (body?.filters?.caseType === "All" || !body?.filters?.caseType) {
      delete body.filters.caseType;
    }
    if (
      body?.filters?.previousPolicyType === "All" ||
      !body?.filters?.previousPolicyType
    ) {
      delete body.filters.previousPolicyType;
    }
    if (body?.filters?.planType === "All" || !body?.filters?.planType) {
      delete body.filters.planType;
    }
    if (
      userInfo?.pos_role_id !== PosRoles.Agent &&
      body?.filters?.isRAP != null
    ) {
      delete body.filters.isRAP;
    }
    if (body?.filters?.isRAP != null) {
      body.filters.dealerId = userInfo?.dealer_id.toString();
    }
    if (!!body?.filters?.isGuest) {
      body.filters.creatorType = "GUEST";
    }
    if (body?.filters.hasOwnProperty("isGuest")) {
      delete body.filters.isGuest;
    }
    if (!!body?.filters?.isHomeVisit) {
      body.filters.subSource = fusionConfig.sub_source;
    }

    if (REMOVE_DATE_RANGE_KEYS.some((key) => !!body?.filters?.[key])) {
      delete body?.filters?.createdDateRange;
    }

    delete body?.filters?.isHomeVisit;

    const mapping = {
      chequePending: () => {
        body.filters.chequeStatus = "843,844";
        delete body.filters.chequeCases;
      },
      backDocPending: () => {
        body.filters.backDocStatus = "848,849";
        delete body.filters.chequeCases;
      },
    };

    mapping[body?.filters?.chequeCases]?.();
  }

  @UseCache({ expiryTimer: 7200 })
  public async getPosRoles(): Promise<any> {
    const posRoleDetails = await RolesTable.findAll({
      attributes: ["id", "name", ["idtree_designation_id", "designationId"]],
    });
    return posRoleDetails;
  }

  public async getCaseListingLeadsAndCount(
    reqBody: any,
    medium: string
  ): Promise<any> {
    const caseListingFilterParams = { ...reqBody };
    let productType = caseListingFilterParams.productType.toLowerCase();
    if (productType === WELLNESS.toLowerCase()) {
      caseListingFilterParams.filters.planType =
        caseListingFilterParams.filters.productType;
    }

    let projectionFields = await this.configService.getConfigValueByKey(
      reqBody.isRenewal
        ? config.RENEWAL_PROJECTION_FIELDS
        : config.CASE_LISTING_PROJECTION_FIELDS
    );
    const customProjections = caseListingFilterParams["projections"] ?? [];
    projectionFields = [...projectionFields[productType], ...customProjections];
    const projections = projectionFields.toString();
    delete caseListingFilterParams.projections;
    delete caseListingFilterParams.productType;
    delete caseListingFilterParams.filters.subordinateId;
    delete caseListingFilterParams.filters.designationId;

    let getCasesCount = true;
    let getCaseList = true;
    if (reqBody.hasOwnProperty("getCount")) {
      getCasesCount = reqBody?.getCount;
    }

    if (reqBody.hasOwnProperty("getList")) {
      getCaseList = reqBody?.getList;
    }

    const caseListingLeadsParams: any = {
      filters: JSON.stringify(caseListingFilterParams.filters),
      medium,
      limit: caseListingFilterParams.limit,
      projections,
    };
    if (caseListingFilterParams.prevCursor) {
      caseListingLeadsParams.prevCursor = caseListingFilterParams.prevCursor;
    }
    if (caseListingFilterParams.nextCursor) {
      caseListingLeadsParams.nextCursor = caseListingFilterParams.nextCursor;
    }

    const caseCountFilterParams = { ...caseListingFilterParams.filters };
    delete caseCountFilterParams.bucket;

    const caseCountParams: any = {
      filters: JSON.stringify(caseCountFilterParams),
      medium,
    };

    if (reqBody.isRenewal) {
      caseListingLeadsParams.isRenewal = reqBody?.isRenewal;
      caseCountParams.isRenewal = reqBody?.isRenewal;
    }

    if (productType == SME.toLowerCase()) {
      delete caseListingLeadsParams.projections;
    }
    if (
      (reqBody.isRenewal && productType == SME.toLowerCase()) ||
      CAMEL_CASE_PRODUCT_TYPES.includes(productType)
    ) {
      productType = caseListingFilterParams.filters?.productType;
    }
    const [caseListingPromise, masterDataPromise, casesCountPromise]: any[] =
      await Promise.allSettled([
        getCaseList
          ? this.getCaseListingLeads(productType, caseListingLeadsParams)
          : Promise.resolve({}),
        getCaseList && productType.toLowerCase() != "Card"
          ? this.masterApiService.getMasterDataForInsurers(productType)
          : Promise.resolve({}),
        getCasesCount
          ? this.getCaseListingCount(productType, caseCountParams)
          : Promise.resolve({}),
      ]);

    let response = {};
    if (getCaseList) {
      const listingResponse = await this.handleListing(
        caseListingPromise,
        masterDataPromise,
        productType
      );
      response = { ...response, ...listingResponse };
    }

    if (getCasesCount) {
      const countResponse = this.handleCaseCount(
        casesCountPromise,
        productType
      );
      response = { ...response, ...countResponse };
    }
    return response;
  }

  public async handleListing(
    caseListingPromise: any,
    masterDataPromise: any,
    productType: any
  ) {
    if (caseListingPromise?.status !== "fulfilled") {
      return {};
    }
    const caseListingData = caseListingPromise.value;
    if (productType == "card") {
      caseListingData.meta = {};
      caseListingData.meta.pagination = {
        hasNext: caseListingPromise?.value?.hasNext,
        current_page_first_row:
          caseListingPromise?.value?.current_page_first_row,
        current_page_last_row: caseListingPromise?.value?.current_page_last_row,
      };
    }
    let {
      data,
      //eslint-disable-next-line
      meta: { pagination },
    } = caseListingData;
    if (
      masterDataPromise?.status === "fulfilled" &&
      masterDataPromise?.value?.insurers?.length
    ) {
      const insurers = masterDataPromise?.value?.insurers;
      data = this.mapInsurersWithCaseLeads(data, insurers);
    }
    await this.addMissingCreatorName(data);
    return {
      data,
      pagination: {
        hasNext: pagination?.hasNext || false,
        currentPageFirstRow: pagination?.current_page_first_row || null,
        currentPageLastRow: pagination?.current_page_last_row || null,
        totalCases: pagination?.totalCount || null,
      },
    };
  }

  public handleCaseCount(casesCountPromise: any, productType: string) {
    if (casesCountPromise.status !== "fulfilled") {
      return {};
    }
    let caseCount = casesCountPromise?.value?.totalCount ?? {};
    if (productType == "card") {
      caseCount = casesCountPromise?.value?.[0];
    }
    const newCaseCount = this.transformCaseCountResponse(
      caseCount,
      productType
    );
    return { casesCount: newCaseCount };
  }

  public async getCaseListingData(
    caseListingLeads: any[],
    body: any,
    userInfo: any,
    reqMedium: any,
    bucket: string
  ): Promise<any> {
    const caseListingProductTransform = {
      motor: async () =>
        this.getMotorCaseListingDataTransformed(
          caseListingLeads,
          body,
          userInfo,
          reqMedium
        ),
      health: async () =>
        this.getHealthCaseListingDataTransformed(
          caseListingLeads,
          userInfo,
          bucket,
          body,
          reqMedium
        ),
      life: async () =>
        this.getLifeCaseListingDataTransformed(caseListingLeads, bucket, body),
      travel: async () =>
        this.getTravelCaseListingDataTransformed(
          caseListingLeads,
          bucket,
          body
        ),
      hospicash: async () =>
        this.getHospicashCaseListingDataTransformed(
          caseListingLeads,
          bucket,
          body
        ),
      pet: async () =>
        this.getPetCaseListingDataTransformed(caseListingLeads, bucket, body),
      sme: async () =>
        this.getSmeCaseListingDataTransformed(caseListingLeads, bucket, body),
      wellness: async () =>
        this.getWellnessCaseListingDataTransformed(
          caseListingLeads,
          bucket,
          body
        ),
      grouphealth: async () =>
        this.getGroupHealthCaseListingDataTransformed(
          caseListingLeads,
          bucket,
          body
        ),
      card: async () =>
        this.getCardCaseListingDataTransformed(caseListingLeads, bucket, body),
    };
    // return await caseListingProductTransform[body.productType.toLowerCase()]();
    const caseListingTransformedData = await caseListingProductTransform[
      body.productType.toLowerCase()
    ]();
    const configData: any = {
      isEligibleForDialerCallback: false,
    };
    if (userInfo.userType === "Agent") {
      const isProductEligibleForDialerCallback =
        await this.apiposService.isInternalUserMapped({
          dealerUUID: userInfo.uuid,
          product: body.productType.toLowerCase(),
        });
      const policyMedium = body.filters.policyMedium;
      configData.isEligibleForDialerCallback =
        isProductEligibleForDialerCallback &&
        policyMedium === PolicyMedium.ONLINE &&
        bucket !== BucketMapping.issued;
    }
    return {
      data: caseListingTransformedData,
      configData,
    };
  }

  public async renewalDataTransformation(pypEndDate: any, args: any[]) {
    const days = pypEndDate
      ? Math.max(
          Math.floor(
            (new Date(pypEndDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          ),
          0
        )
      : "xx";

    args.forEach((word, index) => {
      if (!CommonUtils.isEmpty(args[index])) {
        args[index] = CommonUtils.capitalizeFirstLetterOfEachWordJoinSeperator(
          args[index],
          "[_| ]+",
          " "
        );
      }
    });

    return { days, args };
  }

  public async getMotorCaseListingDataTransformed(
    caseListingLeads: any[],
    body: any,
    userInfo: any,
    reqMedium: any
  ): Promise<any> {
    const dataToDecrypt = [];
    const userType = userInfo?.userType;
    const caseListingData = await Promise.all(
      caseListingLeads.map(async (lead) => {
        const policyMedium = body?.filters?.policyMedium;
        const updatedAtTimestamp = moment(lead.updatedAt);
        if (policyMedium === "offline") {
          const currentDate = new Date();
          lead.chequePortalLockTat = new Date(lead?.chequePortalLockTat);
          const chequeDueTime = Math.abs(
            lead.chequePortalLockTat - Number(currentDate)
          );
          const chequeDueDays =
            lead.chequePortalLockTat.getDate() === currentDate.getDate()
              ? Math.floor(chequeDueTime / (1000 * 3600 * 24))
              : Math.ceil(chequeDueTime / (1000 * 3600 * 24));
          lead.chequePortalLockTat = `Receipt Upload Due ${
            chequeDueDays == 0 ? "today" : `in ${chequeDueDays} days`
          }`;

          if (chequeDueDays === 0) {
            lead.msgColor = "red";
            lead.bgColor = "redBg";
            lead.clockIcon = "clockIconRed";
          } else {
            lead.msgColor = "yellow";
            lead.bgColor = "yellowBg";
            lead.clockIcon = "clockIconYellow";
          }
        }
        let motorOnlineNewProposalJourneyEnabled = false;
        if (policyMedium === "online") {
          motorOnlineNewProposalJourneyEnabled =
            await this.motorOnlineService.redirectToNewProposalPage({
              gcdCode: lead?.gcdCode,
            });
        }

        const bucket = body?.filters?.bucket;
        let mmv = lead?.vehicleMMV ?? "";
        if (policyMedium === "online") {
          mmv = `${lead.makeName || ""} ${lead.modelName || ""} ${
            lead.variantName || ""
          }`;
        }
        let actionLink = `/proposal/view?leadId=${lead.lead_id}`;
        actionLink =
          this.getMotorActionUrl(
            lead,
            policyMedium,
            motorOnlineNewProposalJourneyEnabled
          ) || actionLink;
        if (bucket === "payment_done" && policyMedium === "offline") {
          actionLink = null;
        }
        let subStatus = lead?.misStatusName;
        if (policyMedium === "online") {
          subStatus = lead?.misSubStatusName;
        }
        subStatus = subStatus ? subStatus.replaceAll("_", " ") : null;

        if (itmsSubStatusVsSlug[lead?.misSubStatus]) {
          subStatus = itmsSubStatusVsSlug[lead.misSubStatus];
        }

        let ticketId = bucket === "issued" ? lead.ucdTicketId : lead.ticketId;
        if (lead?.statusId === 209) {
          ticketId = lead.ticketId;
        }

        let generateActionLink = false;

        if (!lead.ticketMappingId) {
          if (!motorOnlineNewProposalJourneyEnabled) generateActionLink = true;
        }
        if (lead.quoteRequestType === OFFLINE_REQUEST.POLICY_BOOKING) {
          generateActionLink = true;
        }

        const caseListingObj = {
          caseType: lead.caseType,
          heading: lead.registrationNumber,
          subHeading1: `${
            VehicleTypesVsLabel[lead.vehicleType] || ""
          } · ${mmv}`,
          subHeading2: lead.customerName
            ? `Owner: ${CommonUtils.capitalizeFirstLetterOfEachWord(
                lead.customerName,
                " "
              )}`
            : "",
          premium:
            lead.premium && Math.ceil(lead.premium) !== 0
              ? Math.ceil(lead.premium)
              : null,
          actionName: lead.chequeStatus
            ? "View Detail"
            : this.generateActionLinkLabel(body.filters.bucket),
          actionLink: actionLink,
          leadId: lead.lead_id,
          bucket: body.filters.bucket,
          ticketId: ticketId,
          quoteRequestType: lead?.quoteRequestType ?? "",
          ticketMappingId: lead?.ticketMappingId ?? "",
          subStatus: `${subStatus ? subStatus : ""}`,
          updatedAtTimestamp,
          product: "motor",
          backDocStatusName: lead.backDocStatusName ?? "",
          chequeStatusName: lead.chequeStatusName ?? "",
          chequePortalLockTat: lead.chequePortalLockTat ?? "",
          msgColor: lead.msgColor ?? "",
          bgColor: lead.bgColor ?? "",
          clockIcon: lead.clockIcon ?? "",
          backDocRemark: lead?.remarks ?? "",
          generateActionLink,
          gcdCode: lead?.gcdCode,
        };
        const commonFields = this.transformCommonFields(lead, body);
        let renewalListingObj = {};
        if (body.isRenewal) {
          if (userType === "Agent") {
            dataToDecrypt.push(lead.mobileNumber);
          }
          renewalListingObj = await this.getMotorRenewalListingDataTransformed(
            lead,
            reqMedium,
            userType
          );
        }
        return { ...commonFields, ...caseListingObj, ...renewalListingObj };
      })
    );

    if (body.isRenewal && userType === "Agent") {
      await this.encryptionService.assignDecryptedValuesToParticularParamOfObjects(
        caseListingData,
        dataToDecrypt,
        "subHeading3"
      );
    }
    return caseListingData;
  }

  public async getMotorRenewalListingDataTransformed(
    lead: any,
    reqMedium: any,
    userType: any
  ): Promise<any> {
    const args = [lead.previousPolicyType, lead.customerName];
    const renewalTransformedData = await this.renewalDataTransformation(
      lead.pypEndDate,
      args
    );
    const medium = ContextHelper.getStore().get("medium");
    const renewalListingObj = {
      subHeading1: `${lead.makeName || ""} ${lead.modelName || ""} ${
        lead.variantName || ""
      } ${lead.fuelType ? "(" + lead.fuelType + ")" : ""}`,
      subHeading2: args[1],
      subHeading3:
        userType === "Agent"
          ? lead.mobileNumber || ""
          : `${lead.gcdCode || ""}${
              lead.dealerName ? " | " + lead.dealerName : ""
            }`,
      subHeading4: args[0],
      subHeading5: `Expiring in ${renewalTransformedData.days} days on ${
        moment(lead.pypEndDate).format("ddd [,] D MMM YYYY") || "xx-xx-xx"
      }`,
      vehicleType: lead?.vehicleType,
      isRenewalNotice: lead?.isRenewalNotice,
      bitlyUrl: lead?.bitlyUrl,
      isInsurerIntegrated: lead?.isInsurerIntegrated,
      offlineRequestLink:
        (medium === process.env.POS_MEDIUM
          ? process.env.POS_URL
          : process.env.POS_APP_URL) + "/core/offline/vehicle-details",
      isPypDocLink: lead?.isPypDocLink ? true : false,
      actionLink: this.getMotorRenewalActionUrl(lead, reqMedium),
      previousPolicyNumber: lead?.previousPolicyNumber || "NA",
      renewalCaseListingCtaText: this.getRenewalCaseListingCtaText(lead),
    };
    return renewalListingObj;
  }

  public async getHospicashCaseListingDataTransformed(
    caseListingLeads: any[],
    bucket: string,
    body: any
  ): Promise<any> {
    const caseListingData = caseListingLeads.map((lead) => {
      const actionUrl = this.getHospicashActionUrl(lead.leadId, bucket);
      // const policyMedium = body?.filters?.policyMedium;
      // if (policyMedium === "offline") {
      //   actionUrl = null;
      // }

      const insuredMember = lead?.insuredMembers
        ? this.generateInsuredMember(JSON.parse(lead.insuredMembers))
        : "";
      const planName = lead?.planName ?? "";
      const leadListingObj = {
        caseType: lead.businessType,
        heading: lead.customerName
          ? `${CommonUtils.capitalizeFirstLetterOfEachWord(
              lead.customerName,
              " "
            )}`
          : null,
        subHeading1: planName,
        subHeading2:
          (lead.sumInsured ? `Sum Assured: ₹ ${Number(lead.sumInsured)}` : "") +
          "·" +
          (insuredMember ? insuredMember : ""),
        premium: lead.finalPremium ?? null,
        actionLink: actionUrl,
        product: "hospicash",
      };
      const commonFields = this.transformCommonFields(lead, body);
      return { ...commonFields, ...leadListingObj };
    });

    return caseListingData;
  }

  public async getHealthCaseListingDataTransformed(
    caseListingLeads: any[],
    userInfo: any,
    bucket: string,
    body: any,
    reqMedium: any
  ): Promise<any> {
    const dataToDecrypt = [];
    const userType = userInfo?.userType;
    const caseListingData = await Promise.all(
      caseListingLeads.map(async (lead) => {
        const actionUrl = this.getHealthActionUrl(
          lead.prime_lead_id,
          bucket,
          lead?.policyMedium
        );
        const updatedAtTimestamp = moment(lead.updatedAt);

        let subStatus = lead?.misStatusName;
        subStatus = subStatus ? subStatus.replaceAll("_", " ") : null;
        const caseListingObj = {
          caseType: lead.planType,
          heading: lead.customerName
            ? `${CommonUtils.capitalizeFirstLetterOfEachWord(
                lead.customerName,
                " "
              )}`
            : null,
          subHeading1: lead.planName,
          subHeading2: lead.sumAssured
            ? `Sum Assured: ₹ ${Number(lead.sumAssured)}`
            : "",
          premium:
            lead.premium && Math.ceil(lead.premium) != 0
              ? Math.ceil(lead.premium)
              : null,
          leadId: lead.prime_lead_id,
          subStatus: subStatus,
          actionLink: `${actionUrl}`,
          updatedAtTimestamp,
          product: "health",
          age: lead?.age,
          planName: lead?.planName,
        };
        const commonFields = this.transformCommonFields(lead, body);
        let renewalListingObj = {};
        if (body.isRenewal) {
          if (userType === "Agent") {
            dataToDecrypt.push(lead.mobileNumber);
          }
          renewalListingObj = await this.getHealthRenewalListingDataTransformed(
            lead,
            reqMedium,
            userType
          );
        }
        return { ...commonFields, ...caseListingObj, ...renewalListingObj };
      })
    );

    if (body.isRenewal && userType === "Agent") {
      await this.encryptionService.assignDecryptedValuesToParticularParamOfObjects(
        caseListingData,
        dataToDecrypt,
        "subHeading1"
      );
    }

    return caseListingData;
  }

  public async getHealthRenewalListingDataTransformed(
    lead: any,
    reqMedium: any,
    userType: any
  ): Promise<any> {
    const args = [lead.planType, lead.planName, lead.members];
    const renewalTransformedData = await this.renewalDataTransformation(
      lead.pypEndDate,
      args
    );
    const renewalListingObj = {
      subHeading1:
        userType === "Agent"
          ? lead.mobileNumber
          : `${lead.gcdCode}${lead.dealerName ? " | " + lead.dealerName : ""}`,
      subHeading2: args[1],
      subHeading3: args[2],
      subHeading4: args[0],
      subHeading5: `Expiring in ${renewalTransformedData.days} days on ${
        moment(lead.pypEndDate).format("ddd [,] D MMM YYYY") || "xx-xx-xx"
      }`,
      isRenewalNotice: lead?.isRenewalNotice,
      sumAssured: CommonUtils.priceInLacsOrThousands(lead?.sumAssured),
      actionLink: this.getHealthRenewalActionUrl(lead, reqMedium),
      age: lead?.age,
      planName: lead?.planName,
    };
    return renewalListingObj;
  }

  public async getSMERenewalsListingDataTransformed(lead: any): Promise<any> {
    const args = [lead.plan_type, lead.planName, lead.policyNumber];
    const renewalTransformedData = await this.renewalDataTransformation(
      lead.pyp_end_date,
      args
    );
    const renewalListingObj = {
      subHeading3: lead.policyNumber
        ? `Policy Number: ${String(lead.policyNumber)}`
        : "",
      subHeading4: lead.plan_type,
      subHeading5: `Expiring in ${renewalTransformedData.days} days on ${
        moment(lead.pyp_end_date).format("ddd [,] D MMM YYYY") || "xx-xx-xx"
      }`,
      subHeading6: Number(lead.policyNumber) || "",
      sumInsured: CommonUtils.priceInLacsOrThousands(lead?.sumInsured),
    };

    return renewalListingObj;
  }

  public async getLifeCaseListingDataTransformed(
    caseListingLeads: any[],
    bucket: string,
    body: string
  ): Promise<any> {
    const caseListingData = caseListingLeads.map((lead) => {
      let actionUrl = "";
      if (lead?.ticketUuid) {
        actionUrl = this.getLifeOfflineActionUrl(lead.ticketUuid, bucket);
      } else {
        actionUrl = this.getLifeActionUrl(
          lead.prime_lead_id,
          bucket,
          lead.productType
        );
      }

      let subStatus = lead?.misStatusName;
      subStatus = subStatus ? subStatus.replaceAll("_", " ") : null;
      const leadListingObj = {
        caseType: lead.productType,
        heading: lead.customerName
          ? `${CommonUtils.capitalizeFirstLetterOfEachWord(
              lead.customerName,
              " "
            )}`
          : null,
        subHeading1: lead.planName,
        subHeading2: lead.sumAssured
          ? `Sum Assured: ₹ ${Number(lead.sumAssured)}`
          : "",
        premium: lead.premium ?? null,
        subStatus: subStatus,
        actionLink: actionUrl,
        leadId: lead.prime_lead_id,
      };
      const commonFields = this.transformCommonFields(lead, body);
      return { ...commonFields, ...leadListingObj };
    });

    return caseListingData;
  }

  public async getTravelCaseListingDataTransformed(
    caseListingLeads: any[],
    bucket: string,
    body: any
  ): Promise<any> {
    const caseListingData = caseListingLeads.map((lead) => {
      let actionUrl = this.getTravelActionUrl(lead.leadId, bucket);
      const policyMedium = body?.filters?.policyMedium;
      if (policyMedium === "offline") {
        actionUrl = null;
      }

      const insuredMember = lead?.insuredMembers
        ? this.generateInsuredMember(JSON.parse(lead.insuredMembers))
        : "";
      const planName = lead?.planName ?? "";
      const leadListingObj = {
        caseType: lead.businessType,
        heading: lead.customerName
          ? `${CommonUtils.capitalizeFirstLetterOfEachWord(
              lead.customerName,
              " "
            )}`
          : null,
        subHeading1: planName,
        subHeading2:
          (lead.sumInsured ? `Sum Assured: ₹ ${Number(lead.sumInsured)}` : "") +
          "·" +
          (insuredMember ? insuredMember : ""),
        premium: lead.finalPremium ?? null,
        actionLink: actionUrl,
        leadId: lead.leadId,
      };
      const commonFields = this.transformCommonFields(lead, body);
      return { ...commonFields, ...leadListingObj };
    });

    return caseListingData;
  }

  public async getPetCaseListingDataTransformed(
    caseListingLeads: any[],
    bucket: string,
    body: string
  ): Promise<any> {
    const caseListingData = caseListingLeads.map((lead) => {
      const actionUrl = this.getPetActionUrl(lead.leadId, bucket);

      const leadListingObj = {
        caseType: lead.caseType,
        heading: lead.customerName
          ? `${CommonUtils.capitalizeFirstLetterOfEachWord(
              lead.customerName,
              " "
            )}`
          : null,
        subHeading1: lead.planName,
        subHeading2:
          (lead.sumInsured ? `Sum Assured: ₹ ${Number(lead.sumInsured)}` : "") +
          "·" +
          (lead.breedName ? lead.breedName : ""),
        premium: lead.premium ?? null,
        actionLink: actionUrl,
        leadId: lead.leadId,
      };
      const commonFields = this.transformCommonFields(lead, body);
      return { ...commonFields, ...leadListingObj };
    });

    return caseListingData;
  }

  public async getSmeCaseListingDataTransformed(
    caseListingLeads: any[],
    bucket: string,
    body: any
  ): Promise<any> {
    const caseListingData = await Promise.all(
      caseListingLeads.map(async (lead) => {
        const productSlug = lead?.productSlug ?? null;
        const actionUrl = await this.getSmeActionUrl(lead, bucket, productSlug);
        const isAbsoluteUrl = /^(http|https):\/\/([^/]+)/.test(actionUrl);

        const subHeading1 =
          lead?.plan_name ?? SME_SLUGS_TO_NAME[productSlug] ?? null;

        const insuredMember = lead?.insuredMembers
          ? this.generateInsuredMember(JSON.parse(lead.insuredMembers))
          : "";

        const leadListingObj = {
          ...(lead?.policyBookingDate
            ? { createdAt: moment(lead.policyBookingDate).fromNow() }
            : {}),
          caseType: lead.businessType,
          heading: lead.customerName
            ? `${CommonUtils.capitalizeFirstLetterOfEachWord(
                lead.customerName,
                " "
              )}`
            : null,
          subHeading1,
          subHeading2:
            (lead.sumInsured
              ? `Sum Assured: ₹${Number(lead.sumInsured)}`
              : "") + (insuredMember ? `·${insuredMember}` : ""),
          premium: lead.finalPremium ?? null,
          actionLink: actionUrl,
          product: "sme",
          isAbsoluteUrl,
          leadId: lead.leadId,
        };
        let renewalListingObj = {};

        if (body.isRenewal) {
          renewalListingObj = await this.getSMERenewalsListingDataTransformed(
            lead
          );
        }

        const commonFields = this.transformCommonFields(lead, body);
        return { ...commonFields, ...leadListingObj, ...renewalListingObj };
      })
    );

    return caseListingData;
  }

  public async getWellnessCaseListingDataTransformed(
    caseListingLeads: any[],
    bucket: string,
    body: any
  ): Promise<any> {
    const caseListingData = caseListingLeads.map((lead) => {
      let actionUrl = this.getWellnessActionUrl(lead.leadId, bucket);
      const policyMedium = body?.filters?.policyMedium;
      if (policyMedium === "offline") {
        actionUrl = null;
      }

      const insuredMember = lead?.insuredMembers
        ? this.generateInsuredMember(JSON.parse(lead.insuredMembers))
        : "";
      const planName = lead?.planName ?? "";
      const leadListingObj = {
        caseType: lead.planType,
        heading: lead.customerName
          ? `${CommonUtils.capitalizeFirstLetterOfEachWord(
              lead.customerName,
              " "
            )}`
          : null,
        subHeading1: planName,
        subHeading2:
          (lead.sumInsured ? `Sum Assured: ₹ ${Number(lead.sumInsured)}` : "") +
          "·" +
          (insuredMember ? insuredMember : ""),
        premium: lead.price ?? null,
        actionLink: bucket === "issued" ? null : actionUrl,
        leadId: lead.leadId,
      };
      const commonFields = this.transformCommonFields(lead, body);
      return { ...commonFields, ...leadListingObj };
    });

    return caseListingData;
  }

  public async getGroupHealthCaseListingDataTransformed(
    caseListingLeads: any[],
    bucket: string,
    body: any
  ): Promise<any> {
    const caseListingData = caseListingLeads.map((lead) => {
      let actionUrl = this.getGroupHealthActionUrl(lead.leadId, bucket);
      const policyMedium = body?.filters?.policyMedium;
      if (policyMedium === "offline") {
        actionUrl = null;
      }

      const insuredMember = lead?.insuredMembers
        ? this.generateInsuredMember(JSON.parse(lead.insuredMembers))
        : "";
      const planName = lead?.planName ?? "";
      const leadListingObj = {
        caseType: lead.planType,
        heading: lead.customerName
          ? `${CommonUtils.capitalizeFirstLetterOfEachWord(
              lead.customerName,
              " "
            )}`
          : null,
        subHeading1: planName,
        subHeading2:
          (lead.sumInsured ? `Sum Assured: ₹ ${Number(lead.sumInsured)}` : "") +
          "·" +
          (insuredMember ? insuredMember : ""),
        premium: lead.price ?? null,
        actionLink: bucket === "issued" ? null : actionUrl,
      };
      const commonFields = this.transformCommonFields(lead, body);
      return { ...commonFields, ...leadListingObj };
    });

    return caseListingData;
  }

  public async getCardCaseListingDataTransformed(
    caseListingLeads: any[],
    bucket: string,
    body: any
  ): Promise<any> {
    const subStatusMapping = {
      1: "Lead Created",
      2: "Lead Verified",
      3: "Application Initiated",
      4: "Application Submitted",
      5: "Issued",
      6: "Rejected",
      7: "Expired",
      8: "Customer Not Eligible",
      9: "Cards Offered",
      10: "Approved In Principle - In Progress",
      11: "Lead Expired",
      12: "Application Expired",
      13: "Approved In Principle - In KYC Stage",
      14: "Approved In Principle - In Credit Review",
      15: "Application Rejected",
    };

    const subStatusMappingToCTA = {
      1: "Verify Lead",
      2: "Select a Card",
      3: "Complete Application",
      4: "",
      5: "",
      6: "View More Offers",
      7: "",
      8: "Customer Not Eligible",
      9: "Select a Card",
      10: "Call Customer",
      11: "",
      12: "",
      13: "Call Customer",
      14: "Call Customer",
      15: "View More Offers",
    };

    const caseListingData = await Promise.all(
      caseListingLeads.map(async (lead) => {
        let actionUrl = this.getWellnessActionUrl(lead.leadId, bucket);
        const policyMedium = body?.filters?.policyMedium;
        if (policyMedium === "offline") {
          actionUrl = null;
        }

        const insuredMember = lead?.insuredMembers
          ? this.generateInsuredMember(JSON.parse(lead.insuredMembers))
          : "";

        const token = await this.getFinancialServicesAuthenticationToken(
          lead?.agent_id
        );
        const planName = lead?.product_name ?? "";

        const triggerValidValues = (key: unknown) => {
          if (!!key && key !== "NULL") {
            return key;
          }
          return "";
        };

        const leadListingObj = {
          externalSubStatus: lead?.external_sub_status ?? "",
          externalRemarks: lead?.remarks ?? "",
          caseType: subStatusMapping[lead?.sub_status_id],
          heading: lead.customer_name
            ? `${CommonUtils.capitalizeFirstLetterOfEachWord(
                lead.customer_name,
                " "
              )}`
            : null,
          subHeading1: `${lead?.city} . ${lead?.bureau_profile} Credit Score(${lead?.bureau_score_range})`,
          premium: lead.price ?? null,
          insurerName: lead?.product_name ?? "Card not Selected",
          policyNumber: lead?.external_lead_id,
          actionLink: lead?.is_cta_applicable
            ? lead?.kyc_link
            : `https://dev-advisor.easycardsloans.com/channel/processing/credit-card/${lead?.external_lead_id}/?token=${token}`,
          actionName: lead?.is_cta_applicable
            ? "Continue Application"
            : subStatusMappingToCTA[lead?.sub_status_id],
          internalLeadId: triggerValidValues(lead?.lead_id),
          customerName: triggerValidValues(lead?.customer_name),
          externalLeadId: triggerValidValues(lead?.external_lead_id),
          lob: "Card",
          productName: triggerValidValues(lead?.product_name),
          productType: triggerValidValues(lead?.product_type),
          lenderName: triggerValidValues(lead?.oem_name),
          internalStatus: `${triggerValidValues(
            lead?.status_name
          )} ${triggerValidValues(lead?.sub_status_name)}`,
          externalStatus: `${triggerValidValues(lead?.external_status)} ${
            triggerValidValues(lead?.external_sub_status) !== "" ? "-" : ""
          } ${triggerValidValues(lead?.external_sub_status)}`,
          customerIncome: triggerValidValues(lead?.income),
          customerOccupationType:
            triggerValidValues(lead?.employment_type) && lead?.employment_type,
          bureauProfile: triggerValidValues(lead?.bureau_profile),
          bureauScore: triggerValidValues(lead?.bureau_score_range),
          city: triggerValidValues(lead?.city),
          applicationSubmissionDate: triggerValidValues(
            lead?.application_submission_date
          ),
          productIssuanceDate: triggerValidValues(lead?.card_issuance_date),
          updatedAt: triggerValidValues(lead?.application_details_updated),
          gcdCode: triggerValidValues(lead?.agent_id),
          creatorName: triggerValidValues(lead?.creator_name),
          gcdName: triggerValidValues(lead?.dealer_name),
          // loanAmount: triggerValidValues(lead?.loan_amount),
          leadCreationDate: triggerValidValues(lead?.lead_created),
        };
        const commonFields = this.transformCommonFields(lead, body);
        commonFields.createdAt = lead?.lead_created
          ? moment(lead?.lead_created).fromNow()
          : null;
        commonFields.span = lead?.agent_id;

        return { ...commonFields, ...leadListingObj };
      })
    );

    return caseListingData;
  }

  public async getCaseListingLeads(productType: string, params: any) {
    try {
      if (productType != "card") {
        const options = {
          endpoint: `${process.env.LMW_URL}${productType}/v1/leads`,
          config: {
            timeout: process.env.LMW_CASE_COUNT_TIMEOUT ?? 100000,
          },
        };
        Logger.debug(`get case listing leads v2 API request params`, {
          requestParams: {
            params,
            options,
          },
        });
        const caseListingData: any = await this.apiHelper.fetchData(
          options,
          params
        );
        Logger.debug(`get case listing leads v2 API response`);
        return caseListingData;
      } else {
        const options = {
          endpoint: `${process.env.API_CENTRAL_URL}/creditcard/caselisting/leads/v2`,
          config: {
            timeout: process.env.LMW_CASE_COUNT_TIMEOUT ?? 100000,
          },
        };
        Logger.debug(`get case listing leads v2 API request params`, {
          requestParams: {
            params,
            options,
          },
        });

        params.filters = JSON.parse(params.filters);
        params.searchParam = params.filters.searchValue;
        delete params.filters.channelIamId;
        delete params.filters.source;
        delete params.filters.searchValue;
        delete params.filters.creator;
        delete params.filters.cityId;

        const caseListingData: any = await this.apiHelper.postData(
          options,
          params
        );
        Logger.debug(`get case listing leads v2 API response`);
        return caseListingData;
      }
    } catch (err) {
      Logger.error("get case listing leads error", { err });
      return { data: [], pagination: {} };
    }
  }

  public async getCaseListingCount(productType: string, params: any) {
    try {
      if (productType != "card") {
        const options = {
          endpoint: `${process.env.LMW_URL}${productType}/v1/leadsCount`,
          config: {
            timeout: process.env.LMW_CASE_COUNT_TIMEOUT ?? 100000,
          },
        };
        Logger.debug(`get case listing count v2 API request params`, {
          requestParams: {
            params,
            options,
          },
        });
        const caseListingCount: any = await this.apiHelper.fetchData(
          options,
          params
        );
        Logger.debug(
          `get case listing count v2 API response`,
          caseListingCount
        );
        return caseListingCount.data;
      } else {
        const options = {
          endpoint: `${process.env.API_CENTRAL_URL}/creditcard/caselisting/count/v2`,
          config: {
            timeout: process.env.LMW_CASE_COUNT_TIMEOUT ?? 100000,
          },
        };
        params.filters = JSON.parse(params.filters);
        params.searchParam = params.filters.searchValue;
        delete params.filters.channelIamId;
        delete params.filters.source;
        delete params.filters.searchValue;
        delete params.filters.creator;

        Logger.debug(`get case listing count v2 API request params`, {
          requestParams: {
            params,
            options,
          },
        });

        const caseListingCount: any = await this.apiHelper.postData(
          options,
          params
        );
        Logger.debug(
          `get case listing count v2 API response`,
          caseListingCount
        );
        return caseListingCount.data;
      }
    } catch (err) {
      Logger.error("get case listing count error", { err });
      return {};
    }
  }

  public transformCaseCountResponse(casesCount: any, productType: string) {
    const newCasesCount: any = {};
    if (casesCount.offline_quotes) {
      newCasesCount.offlineQuotes = casesCount.offline_quotes;
    } else if (!casesCount.offline_quotes && productType === "motor") {
      newCasesCount.offlineQuotes = 0;
    }

    newCasesCount.proposalPending = casesCount.proposal_pending ?? 0;

    newCasesCount.documentPending = casesCount.document_pending ?? 0;

    newCasesCount.paymentPending = casesCount.payment_pending ?? 0;

    newCasesCount.bookingPending = casesCount.booking_pending ?? 0;

    newCasesCount.issued = casesCount.issued ?? 0;

    newCasesCount.inspection = casesCount.inspection ?? 0;

    newCasesCount.quoteListing = casesCount.quote_listing ?? 0;

    newCasesCount.insuredDetails = casesCount.insured_details ?? 0;

    newCasesCount.paymentDone = casesCount.payment_done ?? 0;

    newCasesCount.upcoming = casesCount.upcoming ?? 0;

    newCasesCount.missed = casesCount.missed ?? 0;

    newCasesCount.gracePeriod = casesCount.grace_period ?? 0;

    newCasesCount.lost = casesCount.lost ?? 0;

    (newCasesCount.allLeads = casesCount?.all_leads ?? 0),
      (newCasesCount.application = casesCount?.application ?? 0),
      (newCasesCount.approvedInPrinciple =
        casesCount?.approved_in_principle ?? 0),
      (newCasesCount.closed = casesCount?.closed ?? 0),
      (newCasesCount.rejected = casesCount?.reject ?? 0);

    return newCasesCount;
  }

  public mapInsurersWithCaseLeads(leads: any[], insurers: InsurerData[]): any {
    const leadsWithInsurers = leads.map((lead) => {
      const insurerIndex = insurers.findIndex(
        (insurer: InsurerData) => insurer.insurerId === Number(lead.insurerId)
      );

      if (insurerIndex > -1) {
        delete lead.insurerId;

        return {
          ...lead,
          insurerLogo: insurers[insurerIndex].insurerLogo,
          insurerId: insurers[insurerIndex].insurerId,
          insurerName: insurers[insurerIndex].shortName,
        };
      } else {
        Logger.debug("no insurer image found", {
          insurerId: lead.insurerId,
        });
        return lead;
      }
    });

    return leadsWithInsurers;
  }

  public async addMissingCreatorName(leads: any): Promise<any> {
    const uniqueCreatorIamIds = new Set();
    leads.forEach((lead: any) => {
      if (lead.creatorName == null && lead.creatorIamId != null) {
        uniqueCreatorIamIds.add(lead.creatorIamId);
      }
    });

    const creatorIamIds: any = Array.from(uniqueCreatorIamIds);

    if (creatorIamIds.length) {
      const creatorIdVsName = await this.fetchCreatorNames(creatorIamIds);
      leads.forEach((lead: any) => {
        lead.creatorName =
          lead.creatorName ?? creatorIdVsName[lead.creatorIamId];
      });
    }
  }

  public async fetchCreatorNames(creatorIamIds: string[]): Promise<any> {
    let creatorIdVsName = {};

    const [userNames, guestNames] = await Promise.all([
      this.queryUserTable(creatorIamIds),
      this.queryGuestTable(creatorIamIds),
    ]);
    const creatorNames = [...userNames, ...guestNames];
    Logger.debug("creator names fetched from db", creatorNames);
    if (creatorNames.length) {
      creatorIdVsName = creatorNames.reduce((map: Object, creator: any) => {
        map[creator.creatorIamId] = `${creator.firstName ?? ""} ${
          creator.lastName ?? ""
        }`;
        return map;
      }, {});
    }
    Logger.debug("creator name vs id map", creatorIdVsName);
    return creatorIdVsName;
  }

  public getMotorActionUrl(
    lead: any,
    policyMedium: any = "offline",
    motorOnlineNewProposalJourneyEnabled = false
  ) {
    if (policyMedium === "offline") {
      const { ticketMappingId } = lead;
      let actionLink = "";
      if (lead.quoteRequestType === "POLICYBOOKING") {
        return actionLink;
      }

      const statusVsLink = {
        [MOTOR_OFFLINE_STATUS.INCOMPLETE]: `/core/offline/vehicle-details?id=${ticketMappingId}`,
        [MOTOR_OFFLINE_STATUS.QUOTE_REQUESTED]: `/core/offline/summary?id=${ticketMappingId}`,
        [MOTOR_OFFLINE_STATUS.QUOTE_SHARED]: `/core/offline/quotes?id=${ticketMappingId}`,
        [MOTOR_OFFLINE_STATUS.CLOSED]: `/core/offline/summary?id=${ticketMappingId}`,
        [MOTOR_OFFLINE_STATUS.PROPOSAL_PENDING]: `/core/offline/proposal?id=${ticketMappingId}`,
        [MOTOR_OFFLINE_STATUS.DOC_PENDING]: `/core/offline/document-details?id=${ticketMappingId}`,
        [MOTOR_OFFLINE_STATUS.PROPOSAL_RECEIVED]: `/core/offline/summary-details?id=${ticketMappingId}`,
        [MOTOR_OFFLINE_STATUS.PAYMENT_LINK_SHARED]: `/core/offline/summary-details?id=${ticketMappingId}`,
        [MOTOR_OFFLINE_STATUS.PAYMENT_DONE]: `/core/offline/summary-details?id=${ticketMappingId}`,
        [MOTOR_OFFLINE_STATUS.POLICY_ISSUED]: `/core/offline/summary-details?id=${ticketMappingId}`,
        [MOTOR_OFFLINE_STATUS.CASE_PICKED]: `/core/offline/summary-details?id=${ticketMappingId}`,
        [MOTOR_OFFLINE_STATUS.INSPECTION_REQUESTED]: `/core/offline/inspection-details?id=${ticketMappingId}`,
        [MOTOR_OFFLINE_STATUS.INSPECTION_SCHEDULE]: `/core/offline/inspection-details?id=${ticketMappingId}`,
        [MOTOR_OFFLINE_STATUS.INSPECTION_RECOMMENDED]: `/core/offline/inspection-details?id=${ticketMappingId}`,
        [MOTOR_OFFLINE_STATUS.INSPECTION_COMPLETED]: `/core/offline/summary-details?id=${ticketMappingId}`,
        [MOTOR_OFFLINE_STATUS.INSPECTION_EXPIRED]: `/core/offline/inspection-details?id=${ticketMappingId}`,
        [MOTOR_OFFLINE_STATUS.INSPECTION_APPROVAL_PENDING]: `/core/offline/inspection-details?id=${ticketMappingId}`,
        [MOTOR_OFFLINE_STATUS.INSPECTION_NOT_RECOMMENDED]: `/core/offline/inspection-details?id=${ticketMappingId}`,
      };
      actionLink = statusVsLink[lead?.statusId];

      if (
        !lead?.insurerId &&
        lead?.statusId === MOTOR_OFFLINE_STATUS.DOC_PENDING
      ) {
        actionLink = `/core/offline/documents?id=${ticketMappingId}`;
      }

      return actionLink;
    } else if (policyMedium === "online") {
      const { lead_id } = lead;
      let actionLink = "";
      if (!motorOnlineNewProposalJourneyEnabled) {
        return actionLink;
      }
      const statusVsLink = {
        [MOTOR_ONLINE_STATUS.STATUS_LEAD_GENERATED]: `/core/online/quotes?leadId=${lead_id}`,
        [MOTOR_ONLINE_STATUS.STATUS_QUOTE_SELECTED]: `/core/online/proposal/basic-details?leadId=${lead_id}`,
        [MOTOR_ONLINE_STATUS.STATUS_PROPOSAL]: `/core/online/proposal/summary?leadId=${lead_id}&stage=paymentSummary`,
        [MOTOR_ONLINE_STATUS.STATUS_INSPECTION]: `/core/online/proposal/inspection?leadId=${lead_id}`,
        [MOTOR_ONLINE_STATUS.STATUS_PAYMENT]: `/core/online/proposal/summary?leadId=${lead_id}&stage=paymentSummary`,
        [MOTOR_ONLINE_STATUS.STATUS_BOOKED]: `/core/online/proposal/summary?leadId=${lead_id}&stage=paymentSummary`,
      };
      actionLink = statusVsLink[lead?.leadStatus];
      return actionLink;
    }
  }
  public getMotorRenewalActionUrl(lead: any, reqMedium: any) {
    const baseUrl =
      reqMedium === "POS" ? process.env.POS_URL : process.env.POS_URL;
    let url = baseUrl;
    if (
      lead.vehicleType === VehicleTypes.GCV ||
      lead.vehicleType === VehicleTypes.PCV
    ) {
      url += "/proposal/view?";
    } else if (!lead.isInsurerIntegrated) {
      url += "/proposal/view?isIntegrated=false&";
    } else {
      url += "/core/online/quotes?";
    }
    url += "leadId=" + lead.lead_id;

    return url;
  }

  public getHealthRenewalActionUrl(lead: any, reqMedium: any) {
    if (reqMedium === "POS") {
      return (
        posBaseUrl +
        `/posui/health-insurance/health-confirm-renewal?leadId=${lead.prime_lead_id}&goback=1`
      );
    } else {
      return (
        posAppBaseUrl +
        `/posui/health-insurance/health-confirm-renewal?leadId=${lead.prime_lead_id}&goback=1`
      );
    }
  }

  public async queryUserTable(creatorIamIds: string[]) {
    const creatorNames: any = await UserTable.findAll({
      where: {
        uuid: creatorIamIds,
      },
      attributes: [
        ["first_name", "firstName"],
        ["last_name", "lastName"],
        ["uuid", "creatorIamId"],
      ],
      raw: true,
    });
    return creatorNames.length ? creatorNames : [];
  }

  public async queryGuestTable(creatorIamIds: string[]) {
    const creatorNames: any = await Guest.findAll({
      where: {
        uuid: creatorIamIds,
      },
      attributes: [
        ["name", "firstName"],
        ["uuid", "creatorIamId"],
      ],
      raw: true,
    });
    return creatorNames.length ? creatorNames : [];
  }

  public getHealthActionUrl(leadId: string, bucket: string, medium: string) {
    const bucketWiseActionUrl = {
      quote_listing: `/posui/health-insurance/checkout?leadId=${leadId}&goback=1`,
      proposal_pending: `/posui/health-insurance/checkout?leadId=${leadId}&goback=1`,
      payment_pending: `/posui/health-insurance/confirm?leadId=${leadId}&goback=1`,
      payment_done: `/posui/health-insurance/health-confirm?leadId=${leadId}&goback=1`,
      issued: `/posui/health-insurance/health-confirm?leadId=${leadId}&goback=1`,
    };
    const offlineBucketUrl = `/healthpayment?token=${leadId}`;
    return medium === "Offline"
      ? offlineBucketUrl
      : bucketWiseActionUrl[bucket] ?? "";
  }

  public getHospicashActionUrl(leadId: string, bucket: string) {
    const bucketWiseActionUrl = {
      quote_listing: `/posui/hospicash/quotes?request=${leadId}#`,
      proposal_pending: `/posui/hospicash/checkout?request=${leadId}#proposalStep1`,
      payment_pending: `/posui/hospicash/paymentfail?leadId=${leadId}`,
      payment_done: `/posui/hospicash/paymentsuccess?leadId=${leadId}`,
      issued: `/posui/hospicash/paymentsuccess?leadId=${leadId}`,
    };
    return bucketWiseActionUrl[bucket];
  }

  public getLifeActionUrl(leadId: string, bucket: string, productType: string) {
    const lifeActionMapping = {
      quote_listing: `/life-insurance/quotes?request=${leadId}`,
      proposal_pending: `/life-insurance/checkout?leadId=${leadId}`,
      payment_pending: `/life-insurance/confirm?leadId=${leadId}`,
      payment_done: `/life-insurance/payment-success?leadId=${leadId}`,
    };
    const investmentActionMapping = {
      quote_listing: `/posui/investment/quotes?request=${leadId}`,
      proposal_pending: `/posui/investment/checkout?leadId=${leadId}#step2`,
      payment_pending: `/posui/investment/confirm?leadId=${leadId}#step3`,
      payment_done: `/posui/investment/payment-success?leadId=${leadId}`,
    };
    return productType === "investment"
      ? investmentActionMapping[bucket]
      : lifeActionMapping[bucket] ?? "";
  }

  public getLifeOfflineActionUrl(ticketUuid: string, bucket: string) {
    const lifeActionMapping = {
      quote_listing: `/core/offline-life/summary?ticketUuid=${ticketUuid}`,
      proposal_pending: `/core/offline-life/basic-details?ticketUuid=${ticketUuid}`,
      payment_pending: `/core/offline-life/summary?ticketUuid=${ticketUuid}`,
      payment_done: `/core/offline-life/summary?ticketUuid=${ticketUuid}`,
    };

    return lifeActionMapping[bucket];
  }

  public getTravelActionUrl(leadId: string, bucket: string) {
    const travelActionMapping = {
      quote_listing: `/posui/travel-insurance/quotes?request=${leadId}`,
      proposal_pending: `/posui/travel-insurance/checkout?request=${leadId}`,
      payment_pending: `/posui/travel-insurance/confirm?request=${leadId}`,
      payment_done: `/posui/travel-insurance/payment-status?request=${leadId}`,
      issued: `/posui/travel-insurance/payment-status?request=${leadId}`,
    };
    return travelActionMapping[bucket] ?? "";
  }

  public getPetActionUrl(leadId: string, bucket: string) {
    const petActionMapping = {
      quote_listing: `/posui/pet-insurance/quotes?request=${leadId}`,
      proposal_pending: `/posui/pet-insurance/checkout?request=${leadId}`,
      payment_pending: `/posui/pet-insurance/confirm?request=${leadId}`,
      payment_done: `/posui/pet-insurance/payment-status?request=${leadId}`,
      issued: `/posui/pet-insurance/payment-status?request=${leadId}`,
    };
    return petActionMapping[bucket] ?? "";
  }

  public async getSmeActionUrl(lead: any, bucket: string, product: string) {
    const { leadId = null, policyDocId = null } = lead;

    if (bucket === BucketMapping.issued) {
      if (!policyDocId) return null;
      let actionUrl = null;
      const response = await this.documentService.addRegisterDocumentV2(
        {},
        policyDocId,
        false
      );
      if (response?.data?.docs) {
        const accessId = response.data.docs[0]?.access_id;
        actionUrl =
          process.env.DOC_SERVICE_URL + `doc-service/v1/documents/` + accessId;
      }
      return actionUrl;
    }

    const smeActionMapping = {
      fire: {
        [BucketMapping.quoteListing]: `/posui/fire-insurance/quotes?request=${leadId}`,
        [BucketMapping.proposalPending]: `/posui/fire-insurance/checkout?request=${leadId}`,
        [BucketMapping.paymentPending]: `/posui/fire-insurance/summary?request=${leadId}`,
        [BucketMapping.paymentDone]: `/posui/fire-insurance/payment-status?request=${leadId}`,
      },
      specificMarine: {
        [BucketMapping.quoteListing]: `/posui/specific-marine-insurance/quotes?request=${leadId}`,
        [BucketMapping.proposalPending]: `/posui/specific-marine-insurance/checkout?request=${leadId}`,
        [BucketMapping.paymentPending]: `/posui/specific-marine-insurance/confirm?request=${leadId}`,
        [BucketMapping.paymentDone]: `/posui/specific-marine-insurance/payment-status?request=${leadId}`,
      },
      workmenCompensation: {
        [BucketMapping.quoteListing]: `/posui/workmen-compensation-insurance/quotes?request=${leadId}`,
        [BucketMapping.proposalPending]: `/posui/workmen-compensation-insurance/checkout?request=${leadId}`,
        [BucketMapping.paymentPending]: `/posui/workmen-compensation-insurance/confirm?request=${leadId}`,
        [BucketMapping.paymentDone]: `/posui/workmen-compensation-insurance/payment-status?request=${leadId}`,
      },
      professionalIndemnity: {
        [BucketMapping.quoteListing]: `/posui/professional-indemnity-insurance/quotes?request=${leadId}`,
        [BucketMapping.proposalPending]: `/posui/professional-indemnity-insurance/checkout?request=${leadId}`,
        [BucketMapping.paymentPending]: `/posui/professional-indemnity-insurance/confirm?request=${leadId}`,
        [BucketMapping.paymentDone]: `/posui/professional-indemnity-insurance/payment-status?request=${leadId}`,
      },
    };
    return smeActionMapping[product]?.[bucket] ?? null;
  }

  public getWellnessActionUrl(leadId: string, bucket: string) {
    const wellnessActionMapping = {
      quote_listing: `/posui/wellness/quotes?request=${leadId}`,
      proposal_pending: `/posui/wellness/checkout?request=${leadId}`,
      payment_pending: `/posui/wellness/confirm?request=${leadId}`,
      payment_done: `/posui/wellness/payment-status?request=${leadId}&medium=AGENT-APP`,
      issued: `/posui/wellness/payment-status?request=${leadId}&medium=AGENT-APP`,
    };
    return wellnessActionMapping[bucket] ?? "";
  }

  public getGroupHealthActionUrl(leadId: string, bucket: string) {
    const groupHealthActionMapping = {
      quote_listing: `/posui/group-health?request=${leadId}`,
      proposal_pending: `/posui/group-health/checkout?request=${leadId}`,
      payment_pending: `/posui/group-health/confirm?request=${leadId}`,
      payment_done: `/posui/group-health/payment-status?request=${leadId}&medium=POS`,
      issued: `/posui/group-health/payment-status?request=${leadId}&medium=POS`,
    };
    return groupHealthActionMapping[bucket] ?? "";
  }

  public generateActionLinkLabel(bucket: string) {
    const bucketLabelMapping = {
      quote_listing: "View Quotes",
      proposal_pending: "Complete Proposal",
      payment_pending: "Complete Payment",
      payment_done: "View Details",
      booking_pending: "View Detail",
      inspection: "Complete Inspection",
      issued: "Download Policy",
      document_pending: "View Detail",
    };
    return bucketLabelMapping[bucket] ?? "View Detail";
  }

  public generateInsuredMember(insuredMemberList: any) {
    const relationVsCount = {};
    const relationArray = [];
    insuredMemberList.forEach((member) => {
      if (!relationVsCount[member.relation]) {
        relationVsCount[member.relation] = 0;
      }
      relationVsCount[member.relation]++;
    });
    for (const [key, value] of Object.entries(relationVsCount)) {
      relationArray.push(`${key}: ${value}`);
    }
    return relationArray.toString();
  }

  public async generateCaseListingLink(
    body: any,
    userInfo: any,
    medium: string
  ) {
    Logger.debug("body and medium", { body, medium });

    let url =
      medium === process.env.APP_MEDIUM
        ? OldPosAppCaseListingUrl
        : OldPosCaseListingUrl;
    let conditionsPassed = false;

    const { pos_role_id } = userInfo;
    const caseListingProducts = await this.configService.getConfigValueByKey(
      config.CASE_LISTING_ACTION_LINK
    );
    const conditions = caseListingProducts?.conditions;
    const roleIdArray = conditions.find(
      (condition: any) => condition.key === "roleId"
    ).value;
    conditionsPassed = roleIdArray.includes(pos_role_id);

    url = conditionsPassed ? CaseListingUrl : url;
    return url;
  }

  public async getPremiumCount(body: any, medium: string): Promise<any> {
    const filterParams = { ...body };
    let productType = filterParams.productType.toLowerCase();

    if (productType === WELLNESS.toLowerCase()) {
      filterParams.filters.planType = filterParams.filters.productType;
    }
    if (CAMEL_CASE_PRODUCT_TYPES.includes(productType)) {
      productType = filterParams?.filters?.productType;
    }

    delete filterParams.productType;
    delete filterParams.filters.subordinateId;
    delete filterParams.filters.designationId;

    let premiumData = await this.fetchPremiumData(body, productType, medium);
    premiumData = this.mapPremiumData(premiumData);
    return premiumData;
  }

  public async fetchPremiumData(
    requestParams: any,
    productType: string,
    medium: string
  ) {
    const options = {
      endpoint: `${process.env.LMW_URL}${productType}/v1/aggregate`,
      config: {
        timeout: 100000,
      },
    };
    const params: any = {
      filters: JSON.stringify(requestParams.filters),
      projections: "totalPremiumSum",
      medium,
    };
    if (
      productType == SME.toLowerCase() ||
      CAMEL_CASE_PRODUCT_TYPES.includes(productType)
    ) {
      params.smeProductType = requestParams.filters?.productType;
    }
    Logger.debug(`calling premium api with following params`, {
      request: {
        options,
        params,
      },
    });
    const premiumData: any = await this.apiHelper.fetchData(options, params);
    Logger.debug(`response from lmw for case listing premium `, premiumData);
    return premiumData;
  }

  public mapPremiumData(premiumData: any) {
    const mappedArray = [];
    premiumData = premiumData.data;
    premiumData.forEach((entry: any) => {
      for (const [key, value] of Object.entries(entry)) {
        let intValue: any = value ?? 0;
        intValue = parseInt(intValue);
        mappedArray.push({
          title: PremiumLabelMapping[key],
          value: `₹ ${intValue.toLocaleString("en-IN")}`,
        });
      }
    });
    return mappedArray;
  }

  public transformCommonFields(lead: any, body: any) {
    const data: any = {};
    const projections = body?.projections ?? [];
    if (
      projections.filter(
        (projection: string) => projection === "salesHierarchy"
      )
    ) {
      const {
        AM,
        AM_employee_id,
        BM,
        BM_employee_id,
        SH,
        SH_employee_id,
        ZH,
        ZH_employee_id,
      } = lead;
      if (!!AM && !!AM_employee_id) {
        data["AM"] = AM;
        data["AM_employee_id"] = AM_employee_id;
      }
      if (!!BM && !!BM_employee_id) {
        data["BM"] = BM;
        data["BM_employee_id"] = BM_employee_id;
      }
      if (!!SH && !!SH_employee_id) {
        data["SH"] = SH;
        data["SH_employee_id"] = SH_employee_id;
      }
      if (!!ZH && !!ZH_employee_id) {
        data["ZH"] = ZH;
        data["ZH_employee_id"] = ZH_employee_id;
      }
    }

    data.creatorName = lead.creatorName || "";
    data.insurerName = lead.insurerName || "";
    data.policyNumber = lead.policyNumber || "";
    data.span = `${lead.gcdCode}${
      lead.dealerName ? " | " + lead.dealerName : ""
    }`;
    data.transactionId = lead?.transactionId;
    data.insurerLogo = lead.insurerLogo;
    data.actionName = this.generateActionLinkLabel(
      !lead?.ticketUuid ? body?.filters?.bucket : ""
    );
    data.createdAt = lead.updatedAt ? moment(lead.updatedAt).fromNow() : null;

    return data;
  }
  public async getCasesUpdate(
    reqBody: any,
    userInfo: any,
    medium: string
  ): Promise<any> {
    const response = {
      cases: [],
    };
    if (
      userInfo?.pos_role_id === PosRoles.Admin ||
      userInfo?.pos_role_id === PosRoles.SuperAdmin
    ) {
      Logger.debug("cases update not visible for role id", {
        posRoleId: userInfo.pos_role_id,
      });
      return response;
    }

    let casesUpdates = [];
    const caseListingFilterParams = { ...reqBody };
    delete caseListingFilterParams.userInfo;
    delete caseListingFilterParams.productType;
    delete caseListingFilterParams.filters.subordinateId;
    delete caseListingFilterParams.filters.designationId;

    const params = [
      {
        filters: {
          ...caseListingFilterParams.filters,
          subStatus: CasesUpdates.ITMS_STATUS.MOTOR_OFFLINE,
          policyMedium: PolicyMedium.OFFLINE,
        },
        limit: CasesUpdates.LIMIT,
        productType: "Motor",
        getCount: false,
      },
      {
        filters: {
          ...caseListingFilterParams.filters,
          subStatus: CasesUpdates.ITMS_STATUS.MOTOR_ONLINE,
          policyMedium: PolicyMedium.ONLINE,
          bucket: BucketMapping.inspection,
        },
        productType: "Motor",
        limit: CasesUpdates.LIMIT,
        getCount: false,
      },
      {
        filters: {
          ...caseListingFilterParams.filters,
          bucket: BucketMapping.paymentPending,
        },
        productType: "Health",
        limit: CasesUpdates.LIMIT,
        getCount: false,
      },
    ];

    const lmwPromises: any[] = params.map((param) =>
      this.getCaseListingLeadsAndCount(param, medium)
    );

    const lmwPromiseResult = await Promise.all(lmwPromises);
    for (let i = 0; i < lmwPromiseResult?.length; i++) {
      if (lmwPromiseResult[i]?.data?.length) {
        Logger.debug("cases received for params", { params: params[i] });
        const casesRes = await this.getCaseListingData(
          lmwPromiseResult[i]?.data,
          params[i],
          userInfo,
          medium,
          params[i].filters.bucket
        );
        casesUpdates = casesUpdates.concat(casesRes?.data);
      }
    }

    casesUpdates.sort((case1: any, case2: any) => {
      return moment
        .utc(case2.updatedAtTimestamp)
        .diff(moment.utc(case1.updatedAtTimestamp));
    });

    const latestCases = casesUpdates.slice(0, 15);
    response.cases = latestCases;
    return response;
  }

  public async getFomoPremiumData(reqBody: any, medium: string) {
    try {
      const fomoFilterParams = { ...reqBody };
      const productType = fomoFilterParams.productType.toLowerCase();
      let projectionFields;
      if (fomoFilterParams.isRenewal) {
        projectionFields = await this.configService.getConfigValueByKey(
          config.RENEWAL_PROJECTION_FIELDS
        );
      }
      const customProjections = fomoFilterParams["projections"] ?? [];
      projectionFields = [
        ...projectionFields[productType],
        ...customProjections,
      ];
      const projections = projectionFields.toString();
      delete fomoFilterParams.projections;
      delete fomoFilterParams.productType;
      delete fomoFilterParams.filters.subordinateId;
      delete fomoFilterParams.filters.designationId;

      const fomoParams: any = {
        filters: JSON.stringify(fomoFilterParams.filters),
        medium,
        limit: fomoFilterParams.limit,
        projections,
      };

      if (fomoFilterParams.prevCursor) {
        fomoParams.prevCursor = fomoFilterParams.prevCursor;
      }
      if (fomoFilterParams.nextCursor) {
        fomoParams.nextCursor = fomoFilterParams.nextCursor;
      }
      if (fomoFilterParams.isRenewal) {
        fomoParams.isRenewal = fomoFilterParams?.isRenewal;
      }
      const fomoDataResponse: any = {
        totalUpcomingFomoPremium: 0,
        totalMissedFomoPremium: 0,
        upcomingLeadsCount: 0,
      };
      const options = {
        endpoint: `${process.env.LMW_URL}${productType}/v1/leads`,
        config: {
          timeout: process.env.LMW_CASE_COUNT_TIMEOUT ?? 100000,
        },
      };
      const upcomingParamsFiltersChange = JSON.parse(fomoParams.filters);
      upcomingParamsFiltersChange.bucket = BucketMapping.upcoming;
      upcomingParamsFiltersChange.isFomo = true;
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + RENEWAL_FOMO_UPCOMING_END_DATE);
      upcomingParamsFiltersChange.policyExpiryDateRange = {
        startDate: today.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      };
      fomoParams.filters = JSON.stringify(upcomingParamsFiltersChange);
      Logger.debug(`get fomo-data API request params for umcoming renewals`, {
        requestParams: {
          fomoParams,
          options,
        },
      });

      const caseListingUpcomingData: any = await this.apiHelper.fetchData(
        options,
        fomoParams
      );
      Logger.debug(`get fomo-data API response for upcoming renewals`, {
        caseListingUpcomingData,
      });
      fomoDataResponse.totalUpcomingFomoPremium =
        caseListingUpcomingData.data[0].prevPremium;
      fomoDataResponse.upcomingLeadsCount =
        caseListingUpcomingData.data[0].totalFomoCount;
      const missedParamsFiltersChange = JSON.parse(fomoParams.filters);
      if (productType === LMW_PRODUCT_SLUGS[0]) {
        missedParamsFiltersChange.bucket = BucketMapping.missed;
      } else if (productType === LMW_PRODUCT_SLUGS[1]) {
        missedParamsFiltersChange.bucket = BucketMapping.lost;
      }
      missedParamsFiltersChange.isFomo = true;
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - RENEWAL_FOMO_MISSED_END_DATE);
      missedParamsFiltersChange.policyExpiryDateRange = {
        startDate: startDate.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
      fomoParams.filters = JSON.stringify(missedParamsFiltersChange);

      Logger.debug(`get fomo-data API request upcoming params`, {
        requestParams: {
          fomoParams,
          options,
        },
      });

      const caseListingMissedData: any = await this.apiHelper.fetchData(
        options,
        fomoParams
      );
      Logger.debug(`get fomo-data API response for missed renewals`, {
        caseListingMissedData,
      });
      fomoDataResponse.totalMissedFomoPremium =
        caseListingMissedData.data[0].prevPremium;
      fomoDataResponse.totalUpcomingFomoPremium = parseFloat(
        (
          fomoDataResponse.totalUpcomingFomoPremium *
          RENEWAL_FOMO_DROP_MULTIPLIER
        ).toFixed(2)
      );
      fomoDataResponse.totalMissedFomoPremium = parseFloat(
        (
          fomoDataResponse.totalMissedFomoPremium * RENEWAL_FOMO_DROP_MULTIPLIER
        ).toFixed(2)
      );
      return fomoDataResponse;
    } catch (err) {
      Logger.error("get fomo-data API error", { err });
      return { data: [], pagination: {} };
    }
  }

  public async getRenewalsCaseListingActionLink(queryParams: any) {
    const options = {
      endpoint: `${process.env.RENEWAL_SERVICE}/single-click/v1/action-link/motor`,
      config: {
        timeout: process.env.LMW_CASE_COUNT_TIMEOUT ?? 100000,
      },
    };
    const renewalsActionLinkData: any = await this.apiHelper.fetchData(
      options,
      queryParams
    );
    return renewalsActionLinkData;
  }

  public async getFinancialServicesAuthenticationToken(body: any) {
    const options = {
      endpoint: `https://partnerintegrationbackendstaging.insurancedekho.com/login/sso`,
      config: {
        timeout: process.env.LMW_CASE_COUNT_TIMEOUT ?? 10000,
      },
    };

    const params = {
      agentName: "Dhananjay Yadav",
      agentId: body,
      tpsId: 1,
      productName: "creditCard",
    };

    const token: any = await this.apiHelper.postData(options, params);
    // console.log(token);
    return token?.data?.data?.token;
  }
  public getRenewalCaseListingCtaText(lead: any) {
    if (
      lead.vehicleType === VehicleTypes.GCV ||
      lead.vehicleType === VehicleTypes.PCV ||
      !lead.isInsurerIntegrated
    ) {
      return RENEWAL_CASE_LISTING_CTA_TEXT.PAY_ON_INSURER_WEBSITE;
    }
    return RENEWAL_CASE_LISTING_CTA_TEXT.RENEW_NOW;
  }

  public async getPolicyDocLink(queryParams: GetPolicyDocLinkQueryDto) {
    if (queryParams.product.toLowerCase() === "motor") {
      const leadId = queryParams?.leadId;
      const policyDocLinkResponse =
        await this.leadMiddlewareService.downloadMotorPolicyDoc(leadId);
      return policyDocLinkResponse;
    }
    throw "Unknown product for Policy Doc";
  }
}

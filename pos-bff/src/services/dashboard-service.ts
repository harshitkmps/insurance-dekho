import { config } from "../constants/config.constants";
import {
  PostionOfNonGeneralProducts,
  SALES_AGGREGATES_PROJECTIONS,
  nopProjections,
  salesHierarProjections,
  vehileTypeArray,
  performanceOrderingPriorityMap,
  caseTypeArray,
  onboardingProjections,
  extendedNopKeys,
  additionalProjectionLobWise,
  creditCardDataProjection,
  TARGET_TIME_DURATION,
  HIERARCHY_TIME_DURATION,
  PRODUCT_LABEL_MAP,
  PARTNER_BASE_DEALERS_COLUMNS,
  PRODUCT_WISE_CATEGORY,
  EXCLUDE_DASHBOARD_PRODUCTS,
  PARTNER_BASE_COHORTS,
  PARTNER_BASE_DOWNLOAD_COLUMNS,
} from "../constants/dashboard.constants";
import { PosInternalRoles, PosRoles } from "../constants/pos-roles.constants";
import CommonUtils from "../utils/common-utils";
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import ConfigService from "./config-service";
import { UseCache } from "../decorators/use-cache.decorator";
import CommonApiHelper from "./helpers/common-api-helper";
import DashboardUtils from "../utils/dashboard-utils";
import ContextHelper from "../services/helpers/context-helper";
import ApiPosService from "./apipos-service";
import moment from "moment";
import { MelorraScrapperService } from "./melorra-scrapper.service";
import { GetPartnerBaseCohortsDto } from "../dtos/dashboard/get-partner-base-cohorts.dto";
import PartnerListingService from "./partner-listing-service";
import { GetPartnerBaseDealersDto } from "../dtos/dashboard/get-partner-base-dealers.dto";
import { GetSalesTrendsDto } from "../dtos/dashboard/get-sales-trends.dto";
import { GetSinglePartnerStatsDto } from "../dtos/dashboard/get-single-partner-stats.dto";
import {
  SalesAggregatesFilters,
  SalesSubCategoryAggregateFilters,
} from "../interfaces/melorra-scrapper/sales-aggregates.interface";
import { SalesTargetsFilters } from "../interfaces/melorra-scrapper/sales-targets.interface";
import {
  ActiveDealerCohortPayload,
  ActiveDealerFilters,
  DealerCountFilters,
  IrregularActiveFilters,
  LessThanNMonthsActiveFilters,
  NMonthsActiveFilters,
  OnboardedButNotActiveFilters,
  PartnerCohortWisePayload,
} from "../interfaces/melorra-scrapper/partner-base-dealer-count.interface";
import {
  PartnerBaseDealersBody,
  PartnerBaseDealerSearchFilter,
} from "../interfaces/melorra-scrapper/partner-base-dealers.interface";
import {
  MonthlyAggregatesFilters,
  MonthlySubCategoryAggregateFilters,
  ProductMonthlyAggregatesFilters,
} from "../interfaces/melorra-scrapper/month-wise-aggregates.interface";
import UtilityService from "./utility-service";
import { DownloadPartnerBaseDto } from "../dtos/dashboard/download-partner-base.dto";
import DateTimeUtils from "../utils/date-time-utils";

@Injectable()
export default class DashboardService {
  constructor(
    private configService: ConfigService,
    private apiHelper: CommonApiHelper,
    private apiPosService: ApiPosService,
    private melorraScrapperService: MelorraScrapperService,
    private partnerListingService: PartnerListingService,
    private utilityService: UtilityService
  ) {}

  public async fetchProducts(userInfo, dashboardProductsConfig): Promise<any> {
    const products = [];
    let generalProducts = dashboardProductsConfig.general,
      nonGeneralProducts = dashboardProductsConfig.nonGeneral;

    let tenantId = null;
    if (userInfo?.tenant_id) tenantId = userInfo?.tenant_id.toString();

    if (
      tenantId &&
      dashboardProductsConfig?.tenantId &&
      dashboardProductsConfig?.tenantId[tenantId] != null &&
      dashboardProductsConfig?.tenantId[tenantId] != undefined
    ) {
      generalProducts = dashboardProductsConfig.tenantId[tenantId].general;
      nonGeneralProducts =
        dashboardProductsConfig.tenantId[tenantId].nonGeneral;
    }

    generalProducts.map((product: object) => {
      products.push({ title: product });
    });

    const eligibleForLife =
      userInfo.pos_role_id !== 3 ||
      (userInfo.pos_role_id == 3 && userInfo.irda_id) ||
      userInfo?.eligible_for_life;

    if (nonGeneralProducts.length && eligibleForLife) {
      nonGeneralProducts.forEach((product: any) => {
        products.splice(PostionOfNonGeneralProducts, 0, { title: product });
      });
    }
    return products;
  }

  public async getDashboardConfig(
    userInfo: any,
    requestOrigin: string
  ): Promise<any> {
    const roleId = userInfo.pos_role_id;
    userInfo.tenant_id = userInfo.tenant_id || 1;
    const configData = {
      insuranceLobs: [],
      dashboardEnabled: false,
      cards: [],
      charts: [],
      conversionCards: [],
      maxTrendChartsEnabled: false,
      partnerListingCtaEnabled: false,
      excludedLobForCharts: [],
    };
    let fusionConfigData = {};
    if (userInfo?.is_fusion_agent) {
      fusionConfigData = await this.getDashboardFusionConfig(
        userInfo,
        requestOrigin
      );
    }
    let maxTrendChartsEnabled = false;
    const [dashboardConfig, insuranceLobsConfig] = await Promise.all([
      this.configService.getConfigValueByKey(config.DASHBOARD_CONFIG),
      this.configService.getConfigValueByKey(config.CASE_LISTING_PRODUCTS),
    ]);
    const insuranceLobConfig = await this.fetchProducts(
      userInfo,
      insuranceLobsConfig
    );
    if (roleId === PosRoles.Agent || roleId === PosRoles.SubAgent) {
      maxTrendChartsEnabled = true;
    }
    if (userInfo?.tenant_id === 0 || userInfo?.tenant_id === null) {
      userInfo.tenant_id = 1;
    }
    const dashboardEnabled =
      dashboardConfig?.enabled &&
      this.configService.checkConditions(dashboardConfig.conditions, userInfo);
    if (!dashboardEnabled) {
      Logger.debug("dashboard disabled for user", { userInfo });
      return { config: configData };
    } else {
      const [cards, charts, conversionCards, partnerListingCtaEnabled] = [
        dashboardConfig?.cards &&
          this.configService.checkConfigArrOfConditions(
            dashboardConfig.cards,
            userInfo,
            requestOrigin
          ),
        dashboardConfig?.charts &&
          this.configService.checkConfigArrOfConditions(
            dashboardConfig.charts,
            userInfo,
            requestOrigin
          ),
        dashboardConfig?.conversionCards &&
          this.configService.checkConfigArrOfConditions(
            dashboardConfig.conversionCards,
            userInfo,
            requestOrigin
          ),
        dashboardConfig?.partner_listing_cta?.enabled &&
          this.configService.checkConditions(
            dashboardConfig.partner_listing_cta?.conditions,
            userInfo
          ),
      ];

      configData.insuranceLobs = insuranceLobConfig ?? [];
      configData.dashboardEnabled = dashboardEnabled;
      configData.cards = cards ?? [];
      configData.charts = charts ?? [];
      configData.conversionCards = conversionCards ?? [];
      configData.maxTrendChartsEnabled = maxTrendChartsEnabled;
      configData.partnerListingCtaEnabled = partnerListingCtaEnabled;
      configData.excludedLobForCharts =
        insuranceLobsConfig?.excludedLobForCharts ?? [];
      Logger.debug("dashboard enabled for user", { userInfo }, "config sent");
      return { config: configData, fusionConfigData: fusionConfigData };
    }
  }

  @UseCache({ useObjectAsKey: true, expiryTimer: 120 })
  public async getDashboardFusionConfig(userInfo: any, requestOrigin: string) {
    const fusionConfigData = {
      insuranceLobs: [],
      dashboardEnabled: false,
      cards: [],
      charts: [],
      maxTrendChartsEnabled: true,
    };
    const dashboardConfig = await this.configService.getConfigValueByKey(
      config.FUSION_DASHBOARD_CONFIG
    );
    const dashboardEnabled =
      dashboardConfig?.enabled &&
      this.configService.checkConditions(dashboardConfig.conditions, userInfo);
    if (!dashboardEnabled) {
      Logger.debug("dashboard disabled for user", { userInfo });
      return fusionConfigData;
    }
    const [cards, charts] = [
      dashboardConfig?.cards &&
        this.configService.checkConfigArrOfConditions(
          dashboardConfig.cards,
          userInfo,
          requestOrigin
        ),
      dashboardConfig?.charts &&
        this.configService.checkConfigArrOfConditions(
          dashboardConfig.charts,
          userInfo,
          requestOrigin
        ),
    ];

    fusionConfigData.insuranceLobs = dashboardConfig?.insuranceLobs;
    fusionConfigData.dashboardEnabled = dashboardEnabled;
    fusionConfigData.cards = cards ?? [];
    fusionConfigData.charts = charts ?? [];
    fusionConfigData.maxTrendChartsEnabled = true;
    Logger.debug(
      "dashboard enabled for user",
      { userInfo },
      "fusion config sent",
      { fusionConfigData }
    );
    return fusionConfigData;
  }

  @UseCache({ expiryTimer: 120 })
  public async fetchChartData(
    startDate: string,
    endDate: string,
    lob: string,
    city_id: string,
    state_id: string,
    projections: any
  ): Promise<any> {
    const options = {
      endpoint: process.env.API_CENTRAL_URL + `/v2/pos/aggregates`,
    };
    const filters = {
      start_date: startDate,
      end_date: endDate,
      lob,
      ...(city_id ? { city_id } : {}),
      ...(state_id ? { state_id } : {}),
    };
    const reqBody = {
      filters: Object.assign({}, filters),
      projections,
    };
    const data = await this.apiHelper.postData(options, reqBody);
    return data;
  }

  @UseCache({ expiryTimer: 120, useObjectAsKey: true })
  public async fetchCardsData(
    startDate: string,
    endDate: string,
    role: string,
    iamUUID: string,
    lob: string,
    projections: any,
    requestBody: any
  ): Promise<any> {
    const options = {
      endpoint: process.env.API_CENTRAL_URL + `/v2/pos/aggregates`,
    };
    requestBody.filters.lob = lob;
    const data = await this.apiHelper.postData(options, requestBody);
    return data;
  }

  @UseCache({ expiryTimer: 120 })
  public async fetchMotorNopData(
    startDate: string,
    endDate: string,
    role: string,
    iamUUID: string,
    caseType: string,
    vehicleType: string,
    projections: any,
    requestBody: any,
    lob: string
  ): Promise<any> {
    const options = {
      endpoint: process.env.API_CENTRAL_URL + `/v2/pos/${lob}/aggregates`,
    };
    if (lob === "motor") {
      requestBody.filters.vehicle_type = vehicleType;
      delete requestBody?.filters?.case_type;
      if (caseType) {
        requestBody.filters.case_type = caseType;
      }
    } else if (lob === "health") {
      delete requestBody?.filters?.policy_type;
      if (caseType) {
        requestBody.filters.policy_type = caseType;
      }
    }

    const data = await this.apiHelper.postData(options, requestBody);
    return data;
  }

  public async getAllLobs(
    request: any,
    teamUuid: string,
    uuid: string,
    roleId: number
  ): Promise<any> {
    const lobs = [];
    let level = "";
    let teamsDetails = request;
    if (uuid) {
      const teamDataForUuid = await this.apiPosService.getUserTeamDetailsByUuid(
        uuid
      );
      teamsDetails = teamDataForUuid["teams"];
      if (PosInternalRoles.includes(roleId)) {
        request = teamsDetails;
      }
    }
    for (const key in request) {
      if (teamsDetails[key]?.teamUuid === teamUuid) {
        lobs.push(key);
        level = teamsDetails?.[key]?.level;
      }
    }
    const formatLob = lobs
      .filter((lob) => !EXCLUDE_DASHBOARD_PRODUCTS.includes(lob))
      .map((lob) => lob.charAt(0).toUpperCase() + lob.slice(1));

    const teamDetails = { lobs: formatLob, level: level };

    return teamDetails;
  }

  public async fetchDashboardData(
    requestBody: any,
    userInfo: any
  ): Promise<any> {
    let response: any = {};
    const filters = {};
    let projections = [];

    const userTeamDetails = await this.getAllLobs(
      userInfo?.teams,
      requestBody.teamUuid,
      requestBody?.uuid,
      userInfo.pos_role_id
    );

    let fusionResponse = {};
    if (userInfo.is_fusion_agent && requestBody.isFusionCase) {
      fusionResponse = await this.fetchDashboardFusionData(
        requestBody,
        userInfo
      );
      response = { ...fusionResponse };
      return response;
    }

    const posRoleId = userInfo.pos_role_id;
    Logger.debug(`fetching dashboard data for uuid ${userInfo?.uuid}`);

    if (posRoleId === PosRoles.Agent || posRoleId === PosRoles.SubAgent) {
      filters["dealer_iam_uuid"] = userInfo["uuid"];
    } else {
      filters["sales_iam_uuid"] = requestBody?.uuid
        ? requestBody.uuid
        : userInfo["uuid"]; // userInfo["uuid"]
      if (
        posRoleId === PosRoles.SuperAdmin ||
        posRoleId === PosRoles.Admin ||
        posRoleId === PosRoles.Executive
      ) {
        delete filters["sales_iam_uuid"];
      }
    }
    filters["lob"] = requestBody.currentProduct;

    const fetchCardsDataForEveryLob = async (requestBody, lobs = []) => {
      const achievements = {};
      Logger.log("req body fetch cards data for every lob", requestBody);
      const result = await Promise.all(
        lobs.map(async (category) => {
          const data = await this.fetchCardsData(
            requestBody["filters"]["start_date"],
            requestBody["filters"]["end_date"],
            filters["role"],
            filters["dealer_iam_uuid"] || filters["sales_iam_uuid"],
            category,
            requestBody["projections"],
            requestBody
          );
          return { category, data };
        })
      );

      const lobData = (result as any).reduce(
        (acc: any, { category, data }: any) => {
          Logger.debug(`the response data for lob : ${category}`, data);

          acc[category] = data;
          return acc;
        },
        {}
      );
      if (!requestBody.acheivementsData) {
        const cardsData: any = {};
        lobs.forEach((lob: string) => {
          cardsData[lob] = lobData[lob]?.data;
        });
        cardsData.All = lobData.All?.data;
        response["cards"] = cardsData;
      } else {
        const temp: any = {};
        lobs.forEach((lob: string) => {
          temp[lob.toLowerCase()] = lobData[lob]?.data;
        });

        const keyMapper = {
          active_agents: "_activation",
          net_premium: "_premium",
          onboarding_count: "onboarding",
          // nop: "_nop",
        };

        Object.entries(temp).forEach(([lob, lobObject]) => {
          if (lobObject) {
            Object.entries(lobObject).forEach(([key, value]) => {
              if (keyMapper[key]) {
                achievements[`${lob}${keyMapper[key]}`] = value;
              }
              if (keyMapper[key] == "onboarding") {
                achievements[`${keyMapper[key]}`] = value;
              }
            });
          }
        });

        Object.entries(temp).forEach(([lob, lobObject]) => {
          if (lobObject) {
            if (additionalProjectionLobWise.has(lob)) {
              const lobWiseProjection = additionalProjectionLobWise.get(lob);
              lobWiseProjection.forEach((projection: string) => {
                achievements[projection] = 0;
              });
            }
          }
        });

        response["acheivements"] = achievements;
      }
    };

    const handleAdditionalProjection = (
      projections,
      category = filters["lob"]
    ) => {
      const additionalProjection = additionalProjectionLobWise.get(
        category?.toLowerCase()
      );
      if (additionalProjection?.length > 0) {
        projections = projections.concat(additionalProjection);
      }
      return projections;
    };

    if (requestBody?.cardsDateRange && !requestBody.targetData) {
      const request: any = {};
      const comparisionRequest: any = {};
      projections = [
        "active_agents",
        "nop",
        "nop_renewed",
        "nop_to_be_renewed",
        "total_agents",
        "total_leads",
        "total_premium",
        "net_premium",
      ];
      projections = handleAdditionalProjection(projections);
      request["projections"] = comparisionRequest["projections"] = projections;
      request["filters"] = { ...filters };
      comparisionRequest["filters"] = { ...filters };

      const dateRange = requestBody.cardsDateRange;
      request["filters"]["start_date"] = dateRange.startDate;
      request["filters"]["end_date"] = dateRange.endDate;

      comparisionRequest["filters"]["start_date"] =
        dateRange.comparisionStartDate;
      comparisionRequest["filters"]["end_date"] = dateRange.comparisionEndDate;

      if (comparisionRequest.filters?.sales_iam_uuid) {
        comparisionRequest.filters.team_uuid = requestBody?.teamUuid;
        comparisionRequest.filters.level_id = userTeamDetails.level;
      }

      Logger.debug(
        "Fetching card data for current date range with filters ",
        request
      );
      Logger.debug(
        "Fetching card data for comparision date range with filters ",
        comparisionRequest
      );
      if (requestBody?.isDashboardV2) {
        if (requestBody?.teamUuid) {
          request["filters"]["team_uuid"] = requestBody?.teamUuid;
          request["filters"]["level_id"] = userTeamDetails.level;
          request["filters"]["sales_iam_uuid"] = requestBody?.uuid
            ? requestBody.uuid
            : userInfo["uuid"];
          delete request["filters"]["iam_uuid"];
          delete request["filters"]["role"];
        }
        request["projections"].push(
          "onboarding_count",
          "reportee_count",
          "team_active_agents"
        );
        await fetchCardsDataForEveryLob(request, userTeamDetails?.lobs);
      } else {
        if (filters["sales_iam_uuid"]) {
          const userTeamDetails = await this.getAllLobs(
            userInfo?.teams,
            userInfo?.team_rm_mapping?.[0]?.team_uuid,
            "",
            userInfo.pos_role_id
          );
          request["filters"]["team_uuid"] =
            userInfo?.team_rm_mapping?.[0]?.team_uuid;
          request["filters"]["level_id"] = userTeamDetails?.level;
          comparisionRequest.filters.team_uuid = request.filters.team_uuid;
          comparisionRequest.filters.level_id = request.filters.level_id;
        }
        const [currentRangeData, comparisionRangeData] = await Promise.all([
          this.fetchCardsData(
            request["filters"]["start_date"],
            request["filters"]["end_date"],
            filters["role"],
            filters["dealer_iam_uuid"] || filters["sales_iam_uuid"],
            filters["lob"],
            projections,
            request
          ),
          this.fetchCardsData(
            comparisionRequest["filters"]["start_date"],
            comparisionRequest["filters"]["end_date"],
            filters["role"],
            filters["dealer_iam_uuid"] || filters["sales_iam_uuid"],
            filters["lob"],
            projections,
            comparisionRequest
          ),
        ]);

        response.cards = {
          currentRangeData: currentRangeData?.data ?? {},
          comparisionRangeData: comparisionRangeData?.data ?? {},
        };
        extendedNopKeys?.creditCards.forEach((keyToAddAsNop) => {
          const tempNopKey = keyToAddAsNop?.nopKey;
          if (response["cards"]?.[tempNopKey]) {
            keyToAddAsNop?.extendedNopKeys?.forEach((extendedNopKey) => {
              response["cards"][tempNopKey].nop =
                (response["cards"][tempNopKey]?.nop ?? 0) +
                (response["cards"][tempNopKey]?.[extendedNopKey] ?? 0);
            });
          }
        });
      }
    }

    if (requestBody?.chartsFilters) {
      const request = {};
      const filtersAvgData = {};
      filtersAvgData["lob"] = filters["lob"];
      const cityId = userInfo?.city_id;
      const stateId = userInfo?.state_id;
      filtersAvgData["city_id"] = cityId;
      filtersAvgData["state_id"] = stateId;
      const dateRange = requestBody.chartsFilters?.chartTrendsDateRange;
      const maxTrendChartsEnabled =
        requestBody.chartsFilters?.maxTrendChartsEnabled;
      let projections = ["nop", "total_premium"];
      projections = handleAdditionalProjection(projections);
      let avgDataProjections = ["max_nop", "max_total_premium"];
      avgDataProjections = handleAdditionalProjection(avgDataProjections);
      request["projections"] = projections;

      const nopData = [];
      const maxNopData = maxTrendChartsEnabled ? [] : null;
      const premiumData = [];
      const maxPremiumData = maxTrendChartsEnabled ? [] : null;

      const fetchRegionWiseChartData = async (requestBody) => {
        if (maxTrendChartsEnabled) {
          // try for city and then state if data not found
          filtersAvgData["city_id"] = cityId;
          Logger.debug(
            `fetching average data for charts (with city) with filters and range ${requestBody["filters"]["start_date"]}-${requestBody["filters"]["end_date"]}`,
            filtersAvgData
          );

          const cityData = await this.fetchChartData(
            requestBody["filters"]["start_date"],
            requestBody["filters"]["end_date"],
            filtersAvgData["lob"],
            filtersAvgData["city_id"],
            null,
            avgDataProjections
          );

          if (cityData?.data?.total_agents > 1) {
            return cityData.data;
          } else {
            filtersAvgData["state_id"] = stateId;
            Logger.debug(
              "fetching average data for charts (with state) with filters",
              filtersAvgData
            );

            const stateData = await this.fetchChartData(
              requestBody["filters"]["start_date"],
              requestBody["filters"]["end_date"],
              filtersAvgData["lob"],
              null,
              filtersAvgData["state_id"],
              avgDataProjections
            );
            return stateData?.data || {};
          }
        }
        return null;
      };

      const fetchChartDataForCurrentRange = async (requestBody) => {
        const currentRangeData = {};
        Logger.debug("fetching user data for charts with request", requestBody);
        const [userData, regionWiseData] = await Promise.all([
          this.fetchCardsData(
            requestBody["filters"]["start_date"],
            requestBody["filters"]["end_date"],
            requestBody["filters"]["role"],
            requestBody["filters"]["dealer_iam_uuid"] ||
              requestBody["filters"]["sales_iam_uuid"],
            requestBody["filters"]["lob"],
            requestBody["projections"],
            requestBody
          ),
          fetchRegionWiseChartData(requestBody),
        ]);

        currentRangeData["userData"] = userData?.data || {};
        currentRangeData["trendData"] = regionWiseData;
        return currentRangeData;
      };

      const chartData = await Promise.all(
        dateRange.map(async (date) => {
          const requestBody = { ...request };
          requestBody["filters"] = { ...filters };
          requestBody["filters"]["start_date"] = date.startDate;
          requestBody["filters"]["end_date"] = date.endDate;
          const currentDateRangeData = await fetchChartDataForCurrentRange(
            requestBody
          );

          extendedNopKeys?.charts?.forEach((keyToAddAsNop) => {
            const tempNopKey = keyToAddAsNop?.nopKey;
            if (currentDateRangeData?.[tempNopKey]) {
              keyToAddAsNop?.extendedNopKeys?.forEach((extendedNopKey) => {
                currentDateRangeData[tempNopKey].nop =
                  (currentDateRangeData[tempNopKey]?.nop ?? 0) +
                  (currentDateRangeData[tempNopKey]?.[extendedNopKey] ?? 0);
              });
            }
          });

          return currentDateRangeData;
        })
      );

      for (const currentRangeData of chartData) {
        nopData.push(currentRangeData?.["userData"]["nop"]);
        if (maxTrendChartsEnabled) {
          if (!currentRangeData?.["trendData"]?.["max_nop"]) {
            maxNopData.push(null);
          } else {
            maxNopData.push(
              CommonUtils.roundOffNumber(
                currentRangeData["trendData"]["max_nop"]
              )
            ); // check this calc along with edge cases
          }
        }
      }
      for (const currentRangeData of chartData) {
        premiumData.push(currentRangeData?.["userData"]?.["total_premium"]);
        if (maxTrendChartsEnabled) {
          if (!currentRangeData?.["trendData"]?.["max_total_premium"]) {
            maxPremiumData.push(null);
          } else {
            maxPremiumData.push(
              currentRangeData["trendData"]["max_total_premium"]
            ); // check this calc along with edge cases
          }
        }
      }
      response["charts"] = {
        nopData,
        maxNopData,
        premiumData,
        maxPremiumData,
      };
    }

    if (requestBody.targetData) {
      const dateRange = requestBody.cardsDateRange;
      const request: any = {};
      request["projections"] = [...SALES_AGGREGATES_PROJECTIONS];
      request["projections"].push("onboarding_count", "reportee_count");
      request["filters"] = { ...filters };

      request["filters"]["start_date"] = dateRange.startDate;
      request["filters"]["end_date"] = dateRange.endDate;
      request["acheivementsData"] = true;

      const targetFilters: any = {
        date: dateRange.endDate,
        iam_uuid: requestBody.uuid || userInfo?.uuid,
        time_duration: TARGET_TIME_DURATION[requestBody.timeDuration],
      };

      if (requestBody?.teamUuid) {
        targetFilters.team_uuid = requestBody?.teamUuid;
        request["filters"]["team_uuid"] = requestBody?.teamUuid;
        request["filters"]["level_id"] = userTeamDetails.level;
        request["filters"]["sales_iam_uuid"] = requestBody?.uuid
          ? requestBody.uuid
          : userInfo["uuid"];
        delete request["filters"]["iam_uuid"];
        delete request["filters"]["role"];
      }

      Logger.debug(
        "Fetching sales data for the given filters filters ",
        request
      );

      const [target] = await Promise.all([
        this.melorraScrapperService.getOverallTargets(targetFilters),
        fetchCardsDataForEveryLob(request, userTeamDetails.lobs),
      ]);
      response.target = target;
      delete response["cards"];

      const achievPercent = this.getAchievementPercents(response);
      response["achivPercent"] = achievPercent;
      response = {
        name: "My Performance",
        viewLink: false,
        cohorts: this.formatTargetData(response),
      };
    }
    Logger.debug("sending dashboard data", { response });
    if (response["cards"]) {
      const percentageTrendsForCards = this.calculatePercentageTrendsForCards(
        response["cards"]?.currentRangeData,
        response["cards"]?.comparisionRangeData
      );
      const mappedCardValues = this.mapCardValue(
        response["cards"]?.currentRangeData
      );
      const earningSummary = this.prepareEarningSummary(
        percentageTrendsForCards,
        mappedCardValues
      );

      response["cards"].earning_summary = earningSummary;
    }
    return response;
  }

  public calculatePercentageTrendsForCards(
    currentRangeStats,
    comparisionRangeStats
  ) {
    let policies: number,
      premium: number,
      renewals: number,
      agentActivation: number,
      avgLeadConversion: number;
    if (currentRangeStats?.nop && comparisionRangeStats?.nop) {
      policies = CommonUtils.calculatePercentageChange(
        currentRangeStats.nop,
        comparisionRangeStats.nop
      );
    }
    if (
      currentRangeStats?.total_premium &&
      comparisionRangeStats?.total_premium
    ) {
      premium = CommonUtils.calculatePercentageChange(
        currentRangeStats.total_premium,
        comparisionRangeStats.total_premium
      );
    }
    if (
      currentRangeStats?.nop_to_be_renewed &&
      comparisionRangeStats?.nop_to_be_renewed
    ) {
      renewals = CommonUtils.calculatePercentageChange(
        currentRangeStats.nop_renewed / currentRangeStats.nop_to_be_renewed,
        comparisionRangeStats.nop_renewed /
          comparisionRangeStats.nop_to_be_renewed
      );
    }
    if (
      currentRangeStats?.active_agents &&
      comparisionRangeStats?.active_agents
    ) {
      agentActivation = CommonUtils.calculatePercentageChange(
        currentRangeStats.active_agents / currentRangeStats.total_agents,
        comparisionRangeStats.active_agents / comparisionRangeStats.total_agents
      );
    }
    if (
      currentRangeStats?.nop &&
      comparisionRangeStats?.nop &&
      currentRangeStats?.total_leads &&
      comparisionRangeStats?.total_leads
    ) {
      avgLeadConversion = CommonUtils.calculatePercentageChange(
        currentRangeStats.nop / currentRangeStats.total_leads,
        comparisionRangeStats.nop / comparisionRangeStats.total_leads
      );
    }
    return { policies, premium, renewals, agentActivation, avgLeadConversion };
  }
  public mapCardValue(currentRangeStats) {
    const policies = currentRangeStats?.nop ? currentRangeStats.nop : "0";
    const premium = currentRangeStats?.total_premium
      ? CommonUtils.valueToFigure(currentRangeStats.total_premium)
      : "0";
    let renewals = "";
    const nopRenewed = currentRangeStats?.nop_renewed;
    const nopToBeRenewed = currentRangeStats?.nop_to_be_renewed;
    if (nopToBeRenewed && nopToBeRenewed > 0) {
      renewals = `${CommonUtils.calculatePercentageCovered(
        nopRenewed,
        nopToBeRenewed
      )} %`;
    }
    const activeAgents = currentRangeStats?.active_agents
      ? currentRangeStats.active_agents
      : 0;
    const totalAgents = currentRangeStats?.total_agents
      ? currentRangeStats.total_agents
      : 0;
    let agentActivation = "";
    if (totalAgents != 0) {
      agentActivation = `${activeAgents}/${totalAgents}`;
    }
    return { policies, premium, renewals, agentActivation };
  }

  public prepareEarningSummary(percentageTrendsForCards, mappedCardValues) {
    if (
      Object.keys(percentageTrendsForCards).every((key) => {
        const value = percentageTrendsForCards[key];
        return (
          value === undefined ||
          value === null ||
          (typeof value === "string" && value.trim() === "")
        );
      })
    ) {
      return [];
    }
    const earningSummary = [];
    for (const key in percentageTrendsForCards) {
      if (key in mappedCardValues) {
        const iconUrl = "";
        const title = DashboardUtils.getTitleFor(key);
        const value = DashboardUtils.parseValue(key, mappedCardValues[key]);
        const percent = DashboardUtils.parsePercent(
          key,
          percentageTrendsForCards[key]
        );
        const isPositive = DashboardUtils.isPercentagePositive(percent);
        const description = { value, percent, isPositive };
        const summaryItem = { icon_url: iconUrl, title, description };
        earningSummary.push(summaryItem);
      }
    }
    return earningSummary;
  }

  public async fetchHierarchyTargetData(
    requestBody: any,
    userInfo: any
  ): Promise<any> {
    const filters: any = {
      time_duration:
        HIERARCHY_TIME_DURATION[requestBody?.timeDuration] || "MTD",
      iam_uuid: requestBody?.uuid || userInfo?.uuid,
    };
    if (requestBody.orderBy) {
      filters.order_by = requestBody.orderBy;
    }
    if (requestBody.sort) {
      filters.sort = requestBody.sort;
    }
    if (requestBody.teamUuid) {
      filters.team_uuid = requestBody.teamUuid;
    }
    const body: any = {
      offset: requestBody.offset,
      limit: 10,
      projections: [...salesHierarProjections],
      filters,
    };

    const res = await this.melorraScrapperService.getSalesHierarchyAggregates(
      body
    );
    const hierarchyData = res.hierarchy_data || [];
    const percentData = [];

    await Promise.all(
      hierarchyData.map(async (sfaStats: any) => {
        try {
          const targetFilters = {
            date: moment().format("YYYY-MM-DD"),
            iam_uuid: sfaStats.iam_uuid,
            team_uuid: requestBody?.teamUuid,
            time_duration: TARGET_TIME_DURATION[requestBody.timeDuration],
          };

          const targets = await this.melorraScrapperService.getOverallTargets(
            targetFilters
          );

          const achievedData: any = {};
          for (const cohort in sfaStats) {
            const camelCasedCohort = CommonUtils.snakeToCamel(cohort);
            achievedData[camelCasedCohort] = sfaStats[cohort];
          }

          const target = {};
          for (const cohort in targets) {
            const camelCasedCohort = CommonUtils.snakeToCamel(cohort);
            target[camelCasedCohort] = targets[cohort];
          }

          const cohorts = DashboardUtils.getSalesViewCohorts(
            achievedData,
            target
          );

          const result = {
            name: sfaStats.name,
            viewLink: true,
            iamUuid: sfaStats.iam_uuid,
            designationId: sfaStats.designation_id,
            cohorts,
          };

          percentData.push(result);
        } catch (error) {
          Logger.error("Error processing item:", error);
        }
      })
    );

    return percentData;
  }

  public async fetchDashboardFusionData(
    requestBody: any,
    userInfo: any
  ): Promise<any> {
    const response = {};
    const filters = {};
    const currProduct = requestBody.currentProduct;
    let projections = [];
    let fetchDataForFusion = "";

    const uuid = userInfo;
    if (!uuid) {
      throw new HttpException(
        "uuid not found in the system",
        HttpStatus.BAD_REQUEST
      );
    }
    Logger.debug(`fetching dashboard fusion data for uuid ${userInfo?.uuid}`);
    filters["iam_uuid"] = userInfo["uuid"];
    filters["lob"] =
      requestBody.currentProduct === "Investment"
        ? "Life"
        : requestBody.currentProduct;

    if (requestBody?.cardsDateRange) {
      fetchDataForFusion = "cardsData";
      const request = {};
      const comparisionRequest = {};
      projections = ["nop", "total_premium"];
      request["projections"] = comparisionRequest["projections"] = projections;
      request["filters"] = { ...filters };
      comparisionRequest["filters"] = { ...filters };

      const dateRange = requestBody.cardsDateRange;
      request["filters"]["start_date"] = dateRange.startDate;
      request["filters"]["end_date"] = dateRange.endDate;

      comparisionRequest["filters"]["start_date"] =
        dateRange.comparisionStartDate;
      comparisionRequest["filters"]["end_date"] = dateRange.comparisionEndDate;

      Logger.debug(
        "Fetching fusion card data for current date range with filters ",
        request
      );
      Logger.debug(
        "Fetching fusion card data for comparision date range with filters ",
        comparisionRequest
      );
      const [currentRangeData, comparisionRangeData] = await Promise.all([
        this.fetchFusionCardsData(
          request["filters"]["start_date"],
          request["filters"]["end_date"],
          filters["iam_uuid"],
          currProduct,
          fetchDataForFusion,
          projections,
          request
        ),
        this.fetchFusionCardsData(
          comparisionRequest["filters"]["start_date"],
          comparisionRequest["filters"]["end_date"],
          filters["iam_uuid"],
          currProduct,
          fetchDataForFusion,
          projections,
          comparisionRequest
        ),
      ]);

      response["cards"] = {
        currentRangeData: currentRangeData?.data,
        comparisionRangeData: comparisionRangeData?.data,
      };
      Logger.debug(
        "Fetched fusion card data for currentRangeData  and comparisionRangeData ",
        response["cards"]
      );
    }

    if (requestBody?.chartsFilters) {
      fetchDataForFusion = "chartsData";
      const request = {};
      const avgRequest = {};
      const filtersAvgData = {};
      filtersAvgData["lob"] = filters["lob"];
      const dateRange = requestBody.chartsFilters?.chartTrendsDateRange;
      const maxTrendChartsEnabled =
        requestBody.chartsFilters?.maxTrendChartsEnabled;
      const projections = ["nop", "total_premium"];
      const avgDataProjections = ["nop", "total_agents", "total_premium"];
      request["projections"] = projections;
      avgRequest["projections"] = avgDataProjections;

      const nopData = [];
      const maxNopData = maxTrendChartsEnabled ? [] : null;
      const premiumData = [];
      const maxPremiumData = maxTrendChartsEnabled ? [] : null;
      const fetchChartDataForCurrentRange = async (
        requestBody,
        requestBodyForAllAgent
      ) => {
        const currentRangeData = {};
        Logger.debug(
          "fetching fusion user data for charts with request",
          requestBody
        );
        const [agentData, allAgentData] = await Promise.all([
          this.fetchFusionCardsData(
            requestBody["filters"]["start_date"],
            requestBody["filters"]["end_date"],
            filters["iam_uuid"],
            currProduct,
            fetchDataForFusion,
            projections,
            requestBody
          ),
          this.fetchFusionCardsData(
            requestBodyForAllAgent["filters"]["start_date"],
            requestBodyForAllAgent["filters"]["end_date"],
            filters["iam_uuid"],
            currProduct,
            fetchDataForFusion,
            projections,
            requestBodyForAllAgent
          ),
        ]);

        currentRangeData["userData"] = agentData?.data || {};
        currentRangeData["trendData"] = allAgentData?.data;
        return currentRangeData;
      };
      const chartData = await Promise.all(
        dateRange.map(async (date) => {
          const requestBody = { ...request };
          const requestBodyForAllAgent = { ...avgRequest };
          requestBody["filters"] = { ...filters };
          requestBodyForAllAgent["filters"] = { ...filtersAvgData };
          requestBody["filters"]["start_date"] = date.startDate;
          requestBody["filters"]["end_date"] = date.endDate;
          requestBodyForAllAgent["filters"]["start_date"] = date.startDate;
          requestBodyForAllAgent["filters"]["end_date"] = date.endDate;
          const currentDateRangeData = await fetchChartDataForCurrentRange(
            requestBody,
            requestBodyForAllAgent
          );
          return currentDateRangeData;
        })
      );

      for (const currentRangeData of chartData) {
        nopData.push(currentRangeData?.["userData"]["nop"]);
        if (maxTrendChartsEnabled) {
          if (
            !currentRangeData?.["trendData"]?.["nop"] ||
            !currentRangeData?.["trendData"]?.["total_agents"]
          ) {
            maxNopData.push(null);
          } else {
            maxNopData.push(
              CommonUtils.roundOffNumber(
                currentRangeData["trendData"]["nop"] /
                  currentRangeData["trendData"]["total_agents"]
              )
            );
          }
        }
      }
      for (const currentRangeData of chartData) {
        premiumData.push(currentRangeData?.["userData"]?.["total_premium"]);
        if (maxTrendChartsEnabled) {
          if (
            !currentRangeData?.["trendData"]?.["total_premium"] ||
            !currentRangeData?.["trendData"]?.["total_agents"]
          ) {
            maxPremiumData.push(null);
          } else {
            maxPremiumData.push(
              currentRangeData["trendData"]["total_premium"] /
                currentRangeData["trendData"]["total_agents"]
            );
          }
        }
      }
      response["charts"] = {
        nopData,
        maxNopData,
        premiumData,
        maxPremiumData,
      };
    }
    Logger.debug("sending fusion dashboard data", { response });
    return response;
  }

  @UseCache({ useObjectAsKey: true, expiryTimer: 120 })
  public async fetchFusionCardsData(
    startDate: string,
    endDate: string,
    iamUUID: string,
    lob: string,
    fetchDataForFusion: string,
    projections: any,
    requestBody: any
  ): Promise<any> {
    const options = {
      endpoint: process.env.API_CENTRAL_URL + `/v1/fusion/aggregates/`,
    };
    const data = await this.apiHelper.postData(options, requestBody);
    Logger.debug("fetching fusion dashboard data using api calls", { data });
    return data;
  }

  public async fetchOnboarding(request): Promise<any> {
    const fieldBreakupResponse = {};
    const result = [];
    request["projections"] = onboardingProjections;
    const onboardingData = await this.fetchCardsData(
      request["filters"]["start_date"],
      request["filters"]["end_date"],
      request["filters"]["role"],
      request["filters"]["sales_iam_uuid"],
      "All",
      request["projections"],
      request
    );
    fieldBreakupResponse["Onboarding"] = {
      onboarding: onboardingData?.data,
    };
    for (const key in fieldBreakupResponse) {
      const value = fieldBreakupResponse[key];
      result.push({
        key: key,
        leads_created: `${value?.onboarding?.onboarding_leads_count}`,
        leads_in_pipeline: `${value?.onboarding?.onboarding_pending_leads_count}`,
      });
    }
    return result;
  }

  public async fetchCreditCardData(request): Promise<any> {
    const fieldBreakupResponse = {};
    const result = [];
    request["projections"] = creditCardDataProjection;

    const creditCardData = await this.fetchCardsData(
      request["filters"]["start_date"],
      request["filters"]["end_date"],
      request["filters"]["role"],
      request["filters"]["iam_uuid"],
      "Card",
      request["projections"],
      request
    );
    fieldBreakupResponse["Card"] = {
      cardData: creditCardData?.data,
    };

    for (const key in fieldBreakupResponse) {
      const value = fieldBreakupResponse[key];
      result.push({
        key: key,
        leads: `${value?.cardData?.cc_leads_count}`,
        application_submitted: `${value?.cardData?.cc_application_submitted_count}`,
        card_issued: `${value?.cardData?.cc_issued_count}`,
      });
    }
    return result;
  }
  public async fetchMotorActivation(request): Promise<any> {
    const fieldBreakupResponse = {};
    const result = [];
    const fieldBreakupData = vehileTypeArray.map((value) =>
      this.fetchMotorNopData(
        request["filters"]["start_date"],
        request["filters"]["end_date"],
        request["filters"]["role"],
        request["filters"]["sales_iam_uuid"],
        null,
        value,
        request["projections"],
        request,
        "motor"
      )
    );

    const [Tw, Fw, Cv] = await Promise.all(fieldBreakupData);

    fieldBreakupResponse["Activation"] = {
      tw: Tw?.data,
      fw: Fw?.data,
      cv: Cv?.data,
    };

    for (const key in fieldBreakupResponse) {
      const value = fieldBreakupResponse[key];
      result.push({
        key: key,
        tw: `${value?.tw?.active_agents}`,
        fw: `${value?.fw?.active_agents}`,
        cv: `${value?.cv?.active_agents}`,
      });
    }

    return result;
  }
  public async fetchMotorNop(requestBody): Promise<any> {
    const NopData = {};
    const result = [];
    const [fresh, renewal] = await Promise.all([
      this.fetchCategoryBasedData(requestBody, "Fresh"),
      this.fetchCategoryBasedData(requestBody, "Renewal"),
    ]);

    NopData["Fresh"] = fresh;
    NopData["Renewal"] = renewal;

    for (const key in NopData) {
      const value = NopData[key];
      result.push({
        key: key,
        tw: `${value["tw"]["nop"]}`,
        fw: `${value["fw"]["nop"]}`,
        cv: `${value["cv"]["nop"]}`,
      });
    }
    return result;
  }
  public async fetchMotorPremium(requestBody): Promise<any> {
    const NopData = {};
    const result = [];
    const [fresh, renewal] = await Promise.all([
      this.fetchCategoryBasedData(requestBody, "Fresh"),
      this.fetchCategoryBasedData(requestBody, "Renewal"),
    ]);

    NopData["Fresh"] = fresh;
    NopData["Renewal"] = renewal;

    for (const key in NopData) {
      const value = NopData[key];
      result.push({
        key: key,
        tw: `${value?.tw?.nop}/${Math.round(value?.tw?.net_premium)}`,
        fw: `${value?.fw?.nop}/${Math.round(value?.fw?.net_premium)}`,
        cv: `${value?.cv?.nop}/${Math.round(value?.cv?.net_premium)}`,
      });
    }
    return result;
  }
  public async fetchHealthActivation(requestBody): Promise<any> {
    const fieldBreakupResponse = {};
    const result = [];
    const fieldBreakupData = caseTypeArray.map((value) =>
      this.fetchMotorNopData(
        requestBody["filters"]["start_date"],
        requestBody["filters"]["end_date"],
        requestBody["filters"]["role"],
        requestBody["filters"]["sales_iam_uuid"],
        value !== "All" ? value : null,
        null,
        requestBody["projections"],
        requestBody,
        "health"
      )
    );

    const [fresh, renewal] = await Promise.all(fieldBreakupData);

    fieldBreakupResponse["Activation"] = {
      fresh: fresh?.data,
      renewal: renewal?.data,
    };

    for (const key in fieldBreakupResponse) {
      const value = fieldBreakupResponse[key];
      result.push({
        key: key,
        fresh: `${value?.fresh?.active_agents}`,
        renewal: `${value?.renewal?.active_agents}`,
      });
    }

    return result;
  }
  public async fetchHealthNop(requestBody): Promise<any> {
    const fieldBreakupResponse = {};
    const result = [];
    const fieldBreakupData = caseTypeArray.map((value) =>
      this.fetchMotorNopData(
        requestBody["filters"]["start_date"],
        requestBody["filters"]["end_date"],
        requestBody["filters"]["role"],
        requestBody["filters"]["sales_iam_uuid"],
        value !== "All" ? value : null,
        null,
        requestBody["projections"],
        requestBody,
        "health"
      )
    );

    const [fresh, renewal, all] = await Promise.all(fieldBreakupData);

    fieldBreakupResponse["NOP"] = {
      fresh: fresh?.data,
      renewal: renewal?.data,
      all: all.data,
    };

    for (const key in fieldBreakupResponse) {
      const value = fieldBreakupResponse[key];
      result.push({
        key: key,
        fresh: `${value?.fresh?.nop}`,
        renewal: `${value?.renewal?.nop}`,
        booked_and_sourced: `${value?.all?.nop}`,
      });
    }

    return result;
  }
  public async fetchHealthPremium(requestBody): Promise<any> {
    const fieldBreakupResponse = {};
    const result = [];
    const fieldBreakupData = caseTypeArray.map((value) =>
      this.fetchMotorNopData(
        requestBody["filters"]["start_date"],
        requestBody["filters"]["end_date"],
        requestBody["filters"]["role"],
        requestBody["filters"]["sales_iam_uuid"],
        value !== "All" ? value : null,
        null,
        requestBody["projections"],
        requestBody,
        "health"
      )
    );

    const [fresh, renewal, all] = await Promise.all(fieldBreakupData);

    fieldBreakupResponse["Premium"] = {
      fresh: fresh?.data,
      renewal: renewal?.data,
      all: all.data,
    };

    for (const key in fieldBreakupResponse) {
      const value = fieldBreakupResponse[key];
      result.push({
        key: key,
        fresh: `${Math.round(value?.fresh?.net_premium)}`,
        renewal: `${Math.round(value?.renewal?.net_premium)}`,
        booked_and_sourced: `${Math.round(value?.all?.net_premium)}`,
      });
    }

    return result;
  }
  public async fetchCategoryBasedData(requestBody, nopType): Promise<any> {
    const fieldBreakupData = vehileTypeArray.map((value) =>
      this.fetchMotorNopData(
        requestBody["filters"]["start_date"],
        requestBody["filters"]["end_date"],
        requestBody["filters"]["role"],
        requestBody["filters"]["sales_iam_uuid"],
        nopType === "Fresh" ? "Fresh" : "Renewal",
        value,
        requestBody["projections"],
        requestBody,
        "motor"
      )
    );

    const [Tw, Fw, Cv] = await Promise.all(fieldBreakupData);

    const fieldBreakupResponse = {
      tw: Tw?.data,
      fw: Fw?.data,
      cv: Cv?.data,
    };
    return fieldBreakupResponse;
  }

  public async fetchNopData(requestBody: any, userInfo: any): Promise<any> {
    const filters = {};
    let projections = [];

    const uuid = userInfo?.uuid;
    if (!uuid) {
      throw new HttpException(
        "uuid not found in the system",
        HttpStatus?.BAD_REQUEST
      );
    }

    const userTeamDetails = await this.getAllLobs(
      userInfo?.teams,
      requestBody.teamUuid,
      requestBody.uuid,
      userInfo.pos_role_id
    );
    Logger.debug(`fetching dashboard data for uuid ${userInfo?.uuid}`);

    filters["sales_iam_uuid"] = requestBody?.uuid
      ? requestBody.uuid
      : userInfo["uuid"];
    filters["team_uuid"] = requestBody.teamUuid;
    filters["level_id"] = userTeamDetails.level;

    const request = {};
    projections = nopProjections;
    request["projections"] = projections;
    request["filters"] = { ...filters };

    const dateRange = requestBody.cardsDateRange;
    request["filters"]["start_date"] = dateRange.startDate;
    request["filters"]["end_date"] = dateRange.endDate;

    Logger.debug(
      "Fetching NOP data for current date range with filters ",
      request
    );

    let result = [];

    const fetchFunctionsMap = {
      onboarding: this.fetchOnboarding.bind(this),
      motor_activation: this.fetchMotorActivation.bind(this),
      motor_nop: this.fetchMotorNop.bind(this),
      motor_premium: this.fetchMotorPremium.bind(this),
      health_activation: this.fetchHealthActivation.bind(this),
      health_nop: this.fetchHealthNop.bind(this),
      health_premium: this.fetchHealthPremium.bind(this),
      cc_issued_count: this.fetchCreditCardData.bind(this),
    };

    const fetchByBreakupField = async (breakupField) => {
      const fetchFunction = fetchFunctionsMap[breakupField];

      if (!fetchFunction) {
        throw new Error(
          `Breakup is not available for the field: ${breakupField}`
        );
      }

      const data = await fetchFunction(request);
      return data;
    };

    result = await fetchByBreakupField(requestBody.breakupField);

    return result;
  }

  public async fetchSalesUserData(
    requestBody: any,
    userInfo: any
  ): Promise<any> {
    const userTeamDetails = await this.getAllLobs(
      userInfo?.teams,
      requestBody.teamUuid,
      requestBody.uuid,
      userInfo.pos_role_id
    );
    if (!userTeamDetails?.lobs?.length) {
      throw new NotFoundException("No LOBs found for the given team");
    }

    const achievementFilters: SalesAggregatesFilters = {
      sales_iam_uuid: requestBody?.uuid || userInfo.uuid,
      start_date: requestBody.cardsDateRange?.startDate,
      end_date: requestBody.cardsDateRange?.endDate,
    };
    if (requestBody?.teamUuid) {
      achievementFilters.team_uuid = requestBody.teamUuid;
      achievementFilters.level_id = userTeamDetails.level;
    }

    const allLobs = userTeamDetails.lobs.concat("all");

    const allAchievedLobs = await Promise.all(
      allLobs.map(async (product: string) => {
        const data =
          await this.melorraScrapperService.getLobWiseSalesAggregates(
            achievementFilters,
            product.toLowerCase()
          );
        return { category: product.toLowerCase(), data };
      })
    );

    const targetFilters: SalesTargetsFilters = {
      date: moment().format("YYYY-MM-DD"),
      iam_uuid: requestBody.uuid || userInfo.uuid,
      team_uuid: requestBody?.teamUuid,
      time_duration: TARGET_TIME_DURATION[requestBody.timeDuration],
    };

    const [motorBreakupAchieved, healthBreakupAchieved, targets] =
      await Promise.all([
        this.getMotorBreakupAggregates(achievementFilters),
        this.getHealthBreakupAggregates(achievementFilters),
        this.melorraScrapperService.getOverallTargets(targetFilters),
      ]);

    const achievedProductBreakups = motorBreakupAchieved.concat(
      healthBreakupAchieved
    );

    const { achievedData, target } = this.prepareTargetAchievedRes(
      allAchievedLobs,
      achievedProductBreakups,
      targets
    );

    const cohorts = DashboardUtils.getSalesViewCohorts(achievedData, target);
    const response = {
      name: requestBody?.name || "My Performance",
      viewLink: requestBody?.name ? true : false,
      iamUuid: requestBody?.uuid,
      designationId: requestBody?.designationId,
      cohorts,
    };

    return response;
  }

  public async fetchNetBusiness(body: any, userInfo: any): Promise<any> {
    const userTeamDetails = await this.getAllLobs(
      userInfo?.teams,
      body.teamUuid,
      body.uuid,
      userInfo.pos_role_id
    );
    if (!userTeamDetails?.lobs?.length) {
      throw new NotFoundException("No LOBs found for the given team");
    }

    const aggregationFilters: SalesAggregatesFilters = {
      sales_iam_uuid: body.uuid || userInfo.uuid,
      start_date: body.cardsDateRange.startDate,
      end_date: body.cardsDateRange.endDate,
    };

    if (body.teamUuid) {
      aggregationFilters.team_uuid = body.teamUuid;
      aggregationFilters.level_id = userTeamDetails.level;
    }

    const comparisonFilters: SalesAggregatesFilters = {
      ...aggregationFilters,
      start_date: body.cardsDateRange.comparisionStartDate,
      end_date: body.cardsDateRange.comparisionEndDate,
    };

    const productData = await Promise.all(
      userTeamDetails.lobs.map(async (category: string) => {
        const [currentData, prevData] = await Promise.all([
          this.melorraScrapperService.getLobWiseSalesAggregates(
            aggregationFilters,
            category.toLowerCase()
          ),
          this.melorraScrapperService.getLobWiseSalesAggregates(
            comparisonFilters,
            category.toLowerCase()
          ),
        ]);

        const percent =
          Math.round(
            ((currentData?.net_premium - prevData?.net_premium) /
              prevData?.net_premium) *
              10000
          ) / 100;

        return {
          diffPercent: prevData?.net_premium ? Math.abs(percent) : 0,
          product: category,
          currentPremium: Math.round(currentData?.net_premium) || 0,
          change: percent < 0 ? "decrease" : "increase",
          productLabel: PRODUCT_LABEL_MAP[category] ?? category,
        };
      })
    );

    const partnerBaseAggregates =
      await this.melorraScrapperService.getLobWiseSalesAggregates(
        aggregationFilters,
        "all"
      );

    const partnerBaseStats = {
      activeAgents: partnerBaseAggregates.active_agents ?? 0,
      totalAgents: partnerBaseAggregates.total_agents ?? 0,
    };

    return { business: productData, partnerBaseStats };
  }

  public handleAdditionalParams(input: any, keys: any): any {
    if (input && keys) {
      const tempObj = {};
      Object.keys(keys)?.forEach((key) => {
        tempObj[key] = 0;
      });
      return { ...input, ...tempObj };
    }
  }

  public getAchievementPercents(data: any) {
    const target = data?.target;
    const acheivements = data?.acheivements;
    const achievPercent = {};

    Object.keys(target).forEach(function (key) {
      if (key in acheivements && target[key] && target[key] !== 0) {
        achievPercent[key] = `${Math.round(
          (acheivements[key] / target[key]) * 100
        )}%`;
      } else if (key in acheivements) {
        achievPercent[key] = "-";
      }
    });
    return achievPercent;
  }

  public formatTargetData(dataObject: any) {
    const result = [];
    for (const key in dataObject.achivPercent) {
      result.push({
        key: key,
        target: dataObject.target[key],
        achiv: dataObject.acheivements[key],
        achivPercent: dataObject.achivPercent[key],
        priority: performanceOrderingPriorityMap[key],
        isBreakup: false,
      });
    }

    result.sort((a, b) => a.priority - b.priority);

    return result;
  }

  public async getPartnerBaseCohorts(
    query: GetPartnerBaseCohortsDto,
    userInfo: any
  ): Promise<any> {
    const lob = query.lob || "all";
    const teamUuid =
      query.teamUuid || userInfo?.team_rm_mapping?.[0]?.team_uuid;

    const salesDashboardConfig = await this.configService.getConfigValueByKey(
      config.SALES_DASHBOARD_CONFIG
    );
    if (!salesDashboardConfig?.partnerBase?.enabled) {
      throw new ForbiddenException("Partner base not enabled");
    }

    const userTeamDetails = await this.getAllLobs(
      userInfo?.teams,
      teamUuid,
      query.uuid,
      userInfo.pos_role_id
    );
    if (!userTeamDetails?.lobs?.length) {
      throw new NotFoundException("No LOBs found for the given team");
    }

    const filterParams: DealerCountFilters = {
      sales_iam_uuid: query?.uuid || userInfo.uuid,
      team_uuid: teamUuid,
      level_id: userTeamDetails?.level,
    };

    const allCohortFilters: PartnerCohortWisePayload[] = [
      this.getOnboardedNotActiveFilters(filterParams, lob),
      this.getDropOffFilters(filterParams, lob, 1),
    ];

    const monthsActive = [3, 6, 9, 12];
    for (const [index, month] of monthsActive.entries()) {
      allCohortFilters.push(
        this.getRangeDropOffFilters(
          filterParams,
          lob,
          month,
          monthsActive[index + 1]
        )
      );
    }

    allCohortFilters.push(this.getIrregularActiveFilters(filterParams, lob));
    const activeDealerCountFilters = this.getAggregateFilters(filterParams);

    const activeDealerCountRes =
      await this.melorraScrapperService.getLobWiseSalesAggregates(
        activeDealerCountFilters.filters,
        lob.toLowerCase()
      );

    const partnerCohorts: any[] = [
      {
        cohortName: PARTNER_BASE_COHORTS.activeDealers,
        count: activeDealerCountRes.active_agents,
        ...salesDashboardConfig.partnerBase?.cohorts?.[
          PARTNER_BASE_COHORTS.activeDealers
        ],
      },
    ];

    const partnerCohortPromises = [];

    for (const cohortFilter of allCohortFilters) {
      partnerCohortPromises.push(
        this.melorraScrapperService.getCohortWiseDealerCount(
          cohortFilter.filters
        )
      );
    }

    const partnerCohortResponses = await Promise.all(partnerCohortPromises);

    for (const [index, response] of partnerCohortResponses.entries()) {
      const cohortName = allCohortFilters[index].cohortName;
      partnerCohorts.push({
        cohortName,
        count: response?.dealer_count || 0,
        ...salesDashboardConfig.partnerBase?.cohorts?.[cohortName],
      });
    }

    const allLobs = ["All"].concat(userTeamDetails.lobs);

    return { partnerCohorts, lobs: allLobs };
  }

  public getActiveDealerFilters(
    filterParams: DealerCountFilters,
    lob: string,
    isPmtd?: boolean
  ): PartnerCohortWisePayload {
    const dateRange = DashboardUtils.getDateRangeForTimeDuration("mtd");
    const filters: ActiveDealerFilters = {
      ...filterParams,
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
      is_active: true,
      is_active_lob: lob,
    };

    if (isPmtd) {
      filters.is_pmtd_data = true;
    }

    return { cohortName: "activeDealers", filters };
  }

  public getOnboardedNotActiveFilters(
    filterParams: DealerCountFilters,
    lob: string
  ): PartnerCohortWisePayload {
    const dateRange = DashboardUtils.getDateRangeForTimeDuration("mtd");
    const filters: OnboardedButNotActiveFilters = {
      ...filterParams,
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
      all_time_inactive: true,
      inactive_lob: lob,
    };

    return {
      cohortName: "onboardedButNotActive",
      filters,
    };
  }

  public getLessThanNMonthActiveFilters(
    filterParams: DealerCountFilters,
    lob: string,
    months: number
  ): PartnerCohortWisePayload {
    const filters: LessThanNMonthsActiveFilters = {
      ...filterParams,
      current_date: moment().format("YYYY-MM-DD"),
      drop_off_lob: lob,
      active_duration_in_any_month: months,
    };

    return { cohortName: `lessThan${months}MonthsActive`, filters };
  }

  public getDropOffFilters(
    filterParams: DealerCountFilters,
    lob: string,
    month: number
  ): PartnerCohortWisePayload {
    const filters: NMonthsActiveFilters = {
      ...filterParams,
      current_date: moment().format("YYYY-MM-DD"),
      drop_off_lob: lob,
      drop_off_duration: month,
    };

    return { cohortName: `months${month}Active`, filters };
  }

  public getRangeDropOffFilters(
    filterParams: DealerCountFilters,
    lob: string,
    startMonth: number,
    endMonth?: number
  ): PartnerCohortWisePayload {
    const filters: NMonthsActiveFilters = {
      ...filterParams,
      current_date: moment().format("YYYY-MM-DD"),
      drop_off_lob: lob,
      active_duration_in_months: [],
    };

    if (endMonth) {
      for (let month = startMonth; month < endMonth; month++) {
        filters.active_duration_in_months.push(month);
      }
    } else {
      filters.active_duration_in_months.push(startMonth);
    }

    return { cohortName: `months${startMonth}Active`, filters };
  }

  public getIrregularActiveFilters(
    filterParams: DealerCountFilters,
    lob: string
  ): PartnerCohortWisePayload {
    const filters: IrregularActiveFilters = {
      ...filterParams,
      current_date: moment().format("YYYY-MM-DD"),
      drop_off_lob: lob,
      is_irregular: true,
    };

    return { cohortName: PARTNER_BASE_COHORTS.irregularActive, filters };
  }

  public getAggregateFilters(
    filterParams: DealerCountFilters
  ): ActiveDealerCohortPayload {
    const dateRange = DashboardUtils.getDateRangeForTimeDuration("mtd");
    const filters: SalesAggregatesFilters = {
      ...filterParams,
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
    };
    return { cohortName: "activeDealers", filters };
  }

  public async getPartnerBaseDealers(
    query: GetPartnerBaseDealersDto,
    userInfo: any
  ): Promise<any> {
    const lob = query.lob || "all";
    const limit = query.limit || 50;
    const offset = query.offset || 0;
    const teamUuid =
      query.teamUuid || userInfo?.team_rm_mapping?.[0]?.team_uuid;

    const salesDashboardConfig = await this.configService.getConfigValueByKey(
      config.SALES_DASHBOARD_CONFIG
    );
    if (!salesDashboardConfig?.partnerBase?.enabled) {
      throw new ForbiddenException("Partner base not enabled");
    }

    const userTeamDetails = await this.getAllLobs(
      userInfo?.teams,
      teamUuid,
      query.uuid,
      userInfo.pos_role_id
    );
    if (!userTeamDetails) {
      throw new NotFoundException("Team details not found");
    }

    const filterParams: DealerCountFilters = {
      sales_iam_uuid: query?.uuid || userInfo.uuid,
      team_uuid: teamUuid,
      level_id: userTeamDetails?.level,
    };

    const projections =
      this.partnerListingService.selectPartnerListingProjections(
        userTeamDetails,
        query.cohortName,
        query.isDownload
      );

    const DEALER_COHORT_FILTER_MAP = {
      activeDealers: () =>
        this.getActiveDealerFilters(filterParams, lob, query.isPmtd),
      onboardedButNotActive: () =>
        this.getOnboardedNotActiveFilters(filterParams, lob),
      months1Active: () => this.getDropOffFilters(filterParams, lob, 1),
      months3Active: () => this.getRangeDropOffFilters(filterParams, lob, 3, 6),
      months6Active: () => this.getRangeDropOffFilters(filterParams, lob, 6, 9),
      months9Active: () =>
        this.getRangeDropOffFilters(filterParams, lob, 9, 12),
      months12Active: () => this.getRangeDropOffFilters(filterParams, lob, 12),
      irregularActive: () => this.getIrregularActiveFilters(filterParams, lob),
    };

    const { filters } = DEALER_COHORT_FILTER_MAP[query.cohortName]?.();

    const body: PartnerBaseDealersBody = {
      filters,
      projections,
      limit,
      offset,
    };

    const res = await this.melorraScrapperService.getDealers(body);
    const pagination = {
      hasNext: res?.hierarchy_data?.length === limit ? true : false,
      nextCursor: res?.hierarchy_data?.length === limit ? limit + offset : null,
    };
    const { tableHeaders, transformedDealerList } =
      this.preparePartnerBaseDealerRes(
        res?.hierarchy_data,
        projections,
        query.isPmtd,
        query.cohortName,
        query.isDownload
      );
    return {
      tableHeaders,
      dealers: query.isDownload ? res.hierarchy_data : transformedDealerList,
      pagination,
    };
  }

  public async getSinglePartnerStats(
    query: GetSinglePartnerStatsDto,
    userInfo: any,
    dealerUuid: string
  ): Promise<any> {
    const teamUuid =
      query.teamUuid || userInfo?.team_rm_mapping?.[0]?.team_uuid;

    const userTeamDetails = await this.getAllLobs(
      userInfo?.teams,
      teamUuid,
      query.uuid,
      userInfo.pos_role_id
    );
    if (!userTeamDetails) {
      throw new NotFoundException("Team details not found");
    }

    const dateRange = DashboardUtils.getDateRangeForTimeDuration("mtd");
    const filters: PartnerBaseDealerSearchFilter = {
      dealer_iam_uuid: dealerUuid,
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
      is_pmtd_data: query.isPmtd !== false,
    };

    const projections: string[] =
      this.partnerListingService.selectPartnerListingProjections(
        userTeamDetails
      );

    const body: PartnerBaseDealersBody = {
      filters,
      projections,
      isRenewalDashboard: query.isRenewalDashboard,
      limit: 10,
      offset: 0,
    };

    const res = await this.melorraScrapperService.getDealers(body);
    const pagination = {
      hasNext: false,
      nextCursor: null,
    };
    const { tableHeaders, transformedDealerList } =
      this.preparePartnerBaseDealerRes(
        res?.user_data,
        projections,
        query?.isPmtd
      );
    return {
      tableHeaders,
      dealers: transformedDealerList,
      pagination,
    };
  }

  public preparePartnerBaseDealerRes(
    dealers: any[],
    projections: string[],
    isPmtd?: boolean,
    cohortName?: string,
    isDownload?: boolean
  ) {
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      compactDisplay: "long",
    });
    const statProjections = [...projections];
    statProjections.splice(0, 3);
    let columnMap: any = { ...PARTNER_BASE_DEALERS_COLUMNS.default };
    if (PARTNER_BASE_DEALERS_COLUMNS[cohortName]) {
      // column map as per cohort
      columnMap = { ...PARTNER_BASE_DEALERS_COLUMNS[cohortName] };
    }
    if (isDownload) {
      // add download columns in map
      columnMap = { ...columnMap, ...PARTNER_BASE_DOWNLOAD_COLUMNS };
    }
    const transformedDealerList = dealers.map((dealer) => {
      const newObj = {
        name: dealer.name,
        gcdCode: dealer.gcd_code,
        iamUuid: dealer.iam_uuid,
        columns: [],
      };
      for (const projection of statProjections) {
        if (!dealer.hasOwnProperty(projection)) {
          continue;
        }

        if (columnMap[projection]) {
          const column: any = {
            columnName: columnMap[projection],
            value: dealer[projection] ?? 0,
            subText: "",
          };
          if (projection === "onboarding_date") {
            if (!dealer[projection]) {
              column.value = "";
            } else {
              column.value = DateTimeUtils.formatDate(
                dealer[projection],
                "DD MMM YYYY"
              );
              const subText = DateTimeUtils.getDaysDifference(
                dealer[projection],
                new Date(),
                "months"
              );
              column.subText = `( ${subText} months )`;
            }
          } else if (projection === "rm_name") {
            column.value = dealer[projection] || "";
          } else {
            // format currency
            column.value = formatter.format(column.value);
          }
          newObj.columns.push(column);
        }
        if (isPmtd && columnMap[`${projection}_pmtd`]) {
          newObj.columns.push({
            columnName: columnMap[`${projection}_pmtd`],
            value: formatter.format(dealer[`${projection}_pmtd`] ?? 0),
          });
        }
      }
      return newObj;
    });
    const tableHeaders = transformedDealerList?.length
      ? transformedDealerList[0].columns.map((column: any) => column.columnName)
      : [];
    return { transformedDealerList, tableHeaders };
  }

  public async getSalesUserTrend(
    query: GetSalesTrendsDto,
    userInfo: any
  ): Promise<any> {
    const store = await ContextHelper.getStore();
    const sfaUser = store.get("sfaUser");
    const teamUuid =
      query.teamUuid || userInfo?.team_rm_mapping?.[0]?.team_uuid;

    const salesDashboardConfig = await this.configService.getConfigValueByKey(
      config.SALES_DASHBOARD_CONFIG
    );
    if (!salesDashboardConfig?.partnerBase?.enabled) {
      throw new ForbiddenException("Partner base not enabled");
    }

    const userTeamDetails = await this.getAllLobs(
      userInfo?.teams,
      teamUuid,
      query.uuid,
      userInfo.pos_role_id
    );
    if (!userTeamDetails?.lobs?.length) {
      throw new NotFoundException("Team details not found");
    }

    const products = userTeamDetails.lobs;
    const product = query?.product || products[0];
    const filterParams: MonthlyAggregatesFilters = {
      sales_iam_uuid: query?.uuid || userInfo.uuid,
      team_uuid: teamUuid,
      level_id: userTeamDetails?.level,
      start_year_month: parseInt(moment().startOf("year").format("YYYYMM")),
      end_year_month: parseInt(moment().format("YYYYMM")),
    };

    const chartDataPromises = [];
    const charts = [];

    const LOB_GRAPHS_MAP = {
      motor: async () => this.getMotorBreakupMonthlyTrends(filterParams),
      health: async () => this.getHealthBreakupMonthlyTrends(filterParams),
    };

    const filters: ProductMonthlyAggregatesFilters = {
      ...filterParams,
      lob: product.toLowerCase(),
    };
    chartDataPromises.push(
      this.melorraScrapperService.getProductWiseMonthlyTrends(filters)
    );
    charts.push({ subCategory: "Overall", data: [] });

    const subCategoryTrends =
      (await LOB_GRAPHS_MAP[product.toLowerCase()]?.()) ?? {};

    if (subCategoryTrends.charts?.length) {
      charts.push(...subCategoryTrends.charts);
      chartDataPromises.push(...subCategoryTrends.chartDataPromises);
    }

    const results = await Promise.all(chartDataPromises);
    for (const [index, result] of results.entries()) {
      const chartData = DashboardUtils.prepareTrendGraphView(result);
      charts[index].data = chartData;
    }

    return {
      products,
      charts,
      name: sfaUser?.name || userInfo?.first_name,
    };
  }

  public async getMotorBreakupMonthlyTrends(
    filterParams: MonthlyAggregatesFilters
  ): Promise<any> {
    const chartDataPromises = [];
    const charts = [];
    for (const category of PRODUCT_WISE_CATEGORY.motor) {
      const filters: MonthlySubCategoryAggregateFilters = {
        ...filterParams,
        vehicle_type: category.value,
      };

      chartDataPromises.push(
        this.melorraScrapperService.getProductBreakupMonthlyTrends(
          "motor",
          filters
        )
      );
      charts.push({ subCategory: category.name, data: [] });
    }
    return { chartDataPromises, charts };
  }

  public async getHealthBreakupMonthlyTrends(
    filterParams: MonthlyAggregatesFilters
  ) {
    const chartDataPromises = [];
    const charts = [];
    for (const category of PRODUCT_WISE_CATEGORY.health) {
      const filters: MonthlySubCategoryAggregateFilters = {
        ...filterParams,
        policy_type: category.value,
      };
      chartDataPromises.push(
        this.melorraScrapperService.getProductBreakupMonthlyTrends(
          "health",
          filters
        )
      );
      charts.push({ subCategory: category.name, data: [] });
    }

    return { chartDataPromises, charts };
  }

  public async getMotorBreakupAggregates(
    filterParams: SalesAggregatesFilters
  ): Promise<any[]> {
    const promises = [];
    const result = [];
    for (const category of PRODUCT_WISE_CATEGORY.motor) {
      const filters: SalesSubCategoryAggregateFilters = {
        ...filterParams,
        vehicle_type: category.value,
      };
      const capitalizedWord = CommonUtils.capitalizeFirstLetter(category.value);

      result.push({ name: `motor${capitalizedWord}`, value: {} });
      promises.push(
        this.melorraScrapperService.getProductBreakupSalesAggregates(
          "motor",
          filters
        )
      );
    }
    const responses = await Promise.all(promises);
    for (const [index, response] of responses.entries()) {
      result[index].value = response;
    }
    return result;
  }

  public async getHealthBreakupAggregates(
    filterParams: SalesAggregatesFilters
  ): Promise<any[]> {
    const promises = [];
    const result = [];
    for (const category of PRODUCT_WISE_CATEGORY.health) {
      const filters: SalesSubCategoryAggregateFilters = {
        ...filterParams,
        policy_type: category.value,
      };
      const capitalizedWord = CommonUtils.capitalizeFirstLetter(category.value);

      result.push({ name: `health${capitalizedWord}`, value: {} });
      promises.push(
        this.melorraScrapperService.getProductBreakupSalesAggregates(
          "health",
          filters
        )
      );
    }
    const responses = await Promise.all(promises);
    for (const [index, response] of responses.entries()) {
      result[index].value = { net_premium: response.net_premium };
    }
    return result;
  }

  public prepareTargetAchievedRes(
    achievedLobs: any[],
    achievedBreakups: any[],
    targets: any
  ) {
    const achievedData: any = {};
    for (const achievedLob of achievedLobs) {
      for (const cohort in achievedLob.data) {
        const camelCasedCohort = CommonUtils.snakeToCamel(cohort);
        if (camelCasedCohort === "onboardingCount") {
          achievedData[camelCasedCohort] = achievedLob.data[cohort];
        } else {
          const capitalizedWord =
            camelCasedCohort.charAt(0).toUpperCase() +
            camelCasedCohort.slice(1);
          achievedData[`${achievedLob.category}${capitalizedWord}`] =
            achievedLob.data[cohort];
        }
      }
    }

    for (const breakup of achievedBreakups) {
      for (const breakupCohort in breakup.value) {
        const cohort = CommonUtils.convertCamelCaseToStr(
          breakupCohort,
          true,
          ""
        );
        achievedData[`${breakup.name}${cohort}`] = breakup.value[breakupCohort];
      }
    }

    const target = {};
    for (const cohort in targets) {
      const camelCasedCohort = CommonUtils.snakeToCamel(cohort);
      target[camelCasedCohort] = targets[cohort];
    }

    return { achievedData, target };
  }

  public async downloadPartnerBaseDealers(
    body: DownloadPartnerBaseDto,
    userInfo: any
  ) {
    const medium = ContextHelper.getStore().get("medium");
    const headers = {
      authorization: ContextHelper.getStore().get("authorization"),
    };

    const name = userInfo.first_name;
    const email = userInfo.email;
    const uuid = userInfo.uuid;
    const endpoint = "api/v1/dashboard/partner-base/dealers";
    const updatedBody: GetPartnerBaseDealersDto = { ...body, isDownload: true };
    let csvHeadings: any = {
      ...PARTNER_BASE_DOWNLOAD_COLUMNS,
    };
    if (PARTNER_BASE_DEALERS_COLUMNS[body.cohortName]) {
      csvHeadings = {
        ...csvHeadings,
        ...PARTNER_BASE_DEALERS_COLUMNS[body.cohortName],
      };
    } else {
      csvHeadings = { ...csvHeadings, ...PARTNER_BASE_DEALERS_COLUMNS.default };
    }
    const downloadRes = await this.utilityService.downloadData(
      "salesDashboardPartnerBase",
      updatedBody,
      headers,
      medium,
      name,
      email,
      uuid,
      endpoint,
      csvHeadings
    );
    return downloadRes;
  }
}

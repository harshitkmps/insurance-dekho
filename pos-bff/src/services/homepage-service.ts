import { Roles } from "../constants/roles.constants";
import { config } from "../constants/config.constants";
// import { PosRoles } from "../constants/pos-roles.constants";
import { Injectable, Logger } from "@nestjs/common";
import BannerService from "./banner-service";
import CommonWidgetsService from "./common-widgets-service";
import ConfigService from "./config-service";
import PointsService from "./helpers/points-service";
import AgentProfileService from "./agent-profile-service";

@Injectable()
export default class HomepageService {
  constructor(
    private configService: ConfigService,
    private bannerService: BannerService,
    private commonWidgetsService: CommonWidgetsService,
    private pointsService: PointsService,
    private agentProfileService: AgentProfileService
  ) {}

  public async getHomepageConfig(
    userInfo: any,
    requestOrigin: string,
    queryParams: any
  ): Promise<any> {
    const gcdCode = userInfo.gcd_code;
    const roleId = userInfo.pos_role_id;
    const projections = queryParams?.projections?.split(",") ?? [];
    userInfo.tenant_id = userInfo.tenant_id || 1;
    const configData = {
      banners: [],
      embeddedBanner: {},
      training: [],
      insuranceLobs: [],
      promotionalBannersEnabled: false,
      recommendedCoursesEnabled: false,
      points: {},
      dashboardEnabled: false,
      dashboardV2Enabled: false,
      dashboardCards: [],
      chequeCases: [],
      qrEnabled: false,
      lifeEnabled: userInfo.eligible_for_life === 1 ? true : false,
      generalEnabled: userInfo.eligible_for_general === 1 ? true : false,
      otherProductLobs: [],
      showKurukshetra: {
        web: false,
        app: false,
      },
      crossSellEnabled: false,
    };

    const [
      homepageConfig,
      insuranceLobsConfig,
      pointsRes,
      qrEnabled,
      otherProductLobs,
      eligibleRMList,
      kurukshetraConfig,
      crossSellConfig,
    ] = await Promise.all([
      this.configService.getConfigValueByKey(config.HOMEPAGE_POST_LOGIN),
      this.configService.getConfigValueByKey(config.INSURANCE_LOBS),
      (projections?.includes("points") || !projections?.length) &&
        this.pointsService.getPointsAndMedal(gcdCode, roleId),
      this.agentProfileService.isQrEnabled(userInfo),
      this.configService.getConfigValueByKey(config.OTHER_PRODUCT_LOBS),
      this.configService.getConfigValueByKey(
        config.ELIGIBLE_RM_FOR_CREDIT_CARD
      ),
      this.configService.getConfigValueByKey(config.KURUKSHETRA_HOMEPAGE),
      this.configService.getConfigValueByKey(config.CROSS_SELL_CONFIG),
    ]);

    configData.qrEnabled = qrEnabled;

    const showKurukshetra = kurukshetraConfig?.roles?.includes(roleId);
    configData.showKurukshetra.app = showKurukshetra;
    configData.showKurukshetra.web = showKurukshetra;

    const currDate = new Date().toISOString().split("T")[0];
    const userDetails = { ...userInfo };
    if (userDetails?.tenant_id === 0 || userDetails?.tenant_id === null) {
      userDetails.tenant_id = 1;
    }
    const isSalesUser = Roles.POS_SALES_ALL.includes(userDetails.pos_role_id);
    const embeddedBanner = homepageConfig?.embeddedBanner?.enabled
      ? homepageConfig.embeddedBanner
      : {};
    delete embeddedBanner.enabled;

    const homepageBannersPromise = this.commonWidgetsService.getHomepageBanners(
      queryParams,
      homepageConfig.banners?.enabled,
      userDetails,
      currDate,
      requestOrigin
    );

    const shouldShowEmbeddedBannerPromise =
      this.bannerService.checkBannerVisibility(
        embeddedBanner,
        userDetails,
        currDate
      );
    const [homepageBanners, shouldShowEmbeddedBanner] = await Promise.all([
      homepageBannersPromise,
      shouldShowEmbeddedBannerPromise,
    ]);

    configData.banners = homepageBanners;

    configData.embeddedBanner = shouldShowEmbeddedBanner
      ? {
          link: embeddedBanner?.links?.web,
          cta:
            requestOrigin === process.env.POS_MEDIUM
              ? embeddedBanner?.cta?.web
              : embeddedBanner?.cta?.app,
        }
      : {};

    for (const trainingConfig of homepageConfig.training) {
      if (!trainingConfig.enabled) {
        Logger.debug("config not enabled for homepage training: ", {
          heading: trainingConfig.heading,
        });
        continue;
      }

      const trainingObj = {
        heading: trainingConfig.heading,
        banners: [],
      };
      const trainingObjBanners = this.configService.checkConfigArrOfConditions(
        trainingConfig.banners,
        userDetails,
        requestOrigin
      );

      trainingObj.banners = trainingObjBanners ?? [];
      if (trainingObj?.banners?.length) {
        configData.training.push(trainingObj);
      }
    }

    const chequeCasesObj = {
      heading: homepageConfig?.chequeCases?.heading,
      cards: [],
    };

    const [
      insuranceLobConfig,
      promotionalBannersEnabled,
      recommendedCoursesEnabled,
      dashboardEnabled,
      dashboardV2Enabled,
      dashboardCards,
      chequeCasesCards,
      otherProductsConfig,
    ] = [
      this.configService.checkConfigArrOfConditions(
        insuranceLobsConfig,
        userDetails,
        requestOrigin
      ),
      homepageConfig?.promotionalBanners?.enabled &&
        this.configService.checkConditions(
          homepageConfig.promotionalBanners.conditions,
          userDetails
        ),
      homepageConfig?.recommendedCourses?.enabled &&
        this.configService.checkConditions(
          homepageConfig.recommendedCourses.conditions,
          userDetails
        ),
      homepageConfig?.dashboard?.enabled &&
        this.configService.checkConditions(
          homepageConfig.dashboard.conditions,
          userDetails
        ),
      homepageConfig?.dashboardV2?.enabled &&
        this.configService.checkConditions(
          homepageConfig.dashboardV2.conditions,
          userDetails
        ),
      homepageConfig?.dashboard?.enabled &&
        this.configService.checkConfigArrOfConditions(
          homepageConfig?.dashboard?.cards,
          userDetails,
          requestOrigin
        ),
      this.configService.checkConfigArrOfConditions(
        homepageConfig?.chequeCases?.cards,
        userDetails,
        requestOrigin
      ),
      this.configService.checkUserProperties(
        otherProductLobs,
        userDetails,
        eligibleRMList
      ),
    ];

    chequeCasesObj.cards = chequeCasesCards ?? [];
    if (chequeCasesObj?.cards?.length) {
      configData.chequeCases.push(chequeCasesObj);
    }
    configData.insuranceLobs = insuranceLobConfig ?? [];
    configData.promotionalBannersEnabled = promotionalBannersEnabled;
    configData.recommendedCoursesEnabled = recommendedCoursesEnabled;
    configData.dashboardEnabled = dashboardEnabled;
    configData.dashboardV2Enabled = dashboardV2Enabled;
    configData.dashboardCards = !!dashboardCards ? dashboardCards : [];

    configData.points = {
      total: pointsRes.total,
      medal: pointsRes.medal,
    };
    if (isSalesUser) {
      configData.dashboardEnabled = true;
    }
    configData.otherProductLobs = otherProductsConfig;
    if (crossSellConfig?.enabledRoleIds?.includes(userDetails.pos_role_id)) {
      configData.crossSellEnabled = true;
    }
    return { config: configData };
  }
}

import { Injectable, Logger } from "@nestjs/common";
import ConfigService from "./config-service";
import {
  ApiMode,
  config,
  DataType,
  FETCH_BANNER_CACHE_KEY,
  status,
} from "../constants/config.constants";
import DealerService from "./dealer-service";
import { UseCache } from "../decorators/use-cache.decorator";
import {
  Banner,
  BannerCta,
  BannerDateRange,
  BannerLinks,
} from "../interfaces/banner/banner-response.interface";
import { Condition } from "../interfaces/config/generic-conditions.interface";
import ApiPosService from "./apipos-service";
import { BUSINESS_LINES } from "../constants/banner.constants";

@Injectable()
export default class BannerService {
  constructor(
    private dealerService: DealerService,
    private configService: ConfigService,
    private apiPosService: ApiPosService
  ) {}

  @UseCache({ expiryTimer: 86400 })
  public async fetchBanner(
    userInfo: any,
    mobile: string,
    category?: any
  ): Promise<any> {
    Logger.debug("mobile of user in fetch banner", { mobile });
    const dealerId = userInfo?.dealer_id;
    const user = userInfo;

    const params = { dealer_id: dealerId };

    const [dealerDetails, bannerDetail] = await Promise.all([
      dealerId && this.dealerService.getDealerDetails(params),
      this.configService.getConfigValueByKey(config.BANNER_CONFIG),
    ]);
    const today = new Date().toISOString().split("T")[0];
    const from = new Date(bannerDetail.dateRange.from)
      .toISOString()
      .split("T")[0];
    const to = new Date(bannerDetail.dateRange.to).toISOString().split("T")[0];
    const links = { app: "", web: "", appCta: "", webCta: "" };
    if (!(today >= from && today <= to)) {
      return links;
    }
    if (!bannerDetail.conditions?.length) {
      return {
        ...bannerDetail?.links,
        appCta: bannerDetail?.cta?.app ?? "",
        webCta: bannerDetail?.cta?.web ?? "",
      };
    }
    Logger.debug("get the banner details");
    const userDetails = { ...user, ...dealerDetails?.[0] };
    if (userDetails?.tenant_id === 0 || userDetails?.tenant_id === null) {
      userDetails.tenant_id = 1;
    }

    //logic to send the response according to category comming from the api's params.
    //if no category is passed, than the banners of category POS or without any category is sent.
    //if category is passed than the category specific banners are sent in response.
    const conditionValue =
      bannerDetail?.conditions?.find((item) => item.key === "category_id")
        ?.value ?? [];
    const categoryValue = !!category ? Number(category) : BUSINESS_LINES.POS;

    if (conditionValue.includes(categoryValue)) {
      userDetails["category_id"] = categoryValue;
    } else if (!conditionValue.length && !!category) {
      bannerDetail["conditions"] = [
        ...(bannerDetail?.conditions ?? []),
        {
          match: true,
          value: [BUSINESS_LINES.POS],
          key: "category_id",
        },
      ];
    }

    const shouldShowBanner = this.configService.checkConditions(
      bannerDetail.conditions,
      userDetails
    );
    if (shouldShowBanner) {
      return {
        ...bannerDetail?.links,
        appCta: bannerDetail?.cta?.app ?? "",
        webCta: bannerDetail?.cta?.web ?? "",
      };
    }

    return links;
  }

  public async checkBannerVisibility(
    banner: any,
    userDetails: any,
    currDate: string
  ): Promise<boolean> {
    if (currDate < banner.dateRange.from || currDate > banner.dateRange.to) {
      Logger.debug("date range not matched for id exclusive banner", {
        dateRange: banner.dateRange,
      });
      return false;
    }

    //logic to eleminate banners other than POS category.
    //also to validate the banners with no category with them.
    userDetails["category_id"] = (
      banner?.conditions.find((item) => item?.key === "category_id")?.value ||
      []
    ).includes(BUSINESS_LINES.POS)
      ? BUSINESS_LINES.POS
      : -1;

    const shouldShowBanner = this.configService.checkConditions(
      banner.conditions,
      userDetails
    );

    if (!shouldShowBanner) {
      Logger.debug("conditions not matched for banner", {
        links: banner.links,
      });
    }

    return shouldShowBanner;
  }

  public mapObjToBanner(content: any): Banner {
    const links: BannerLinks = content.contentProps.links;
    const cta: BannerCta = content.contentProps.cta;
    const dateRange: BannerDateRange = content.criteria.dateRange;
    const conditions: Condition[] = content.criteria.conditions;
    const banner = {
      links,
      cta,
      dateRange,
      conditions,
    };

    return banner;
  }

  public async updateBannerConfig(body: any): Promise<any> {
    const configValue: Banner = {
      links: body.contentProps.links,
      cta: body.contentProps.cta,
      dateRange: body.criteria.dateRange,
      conditions: body.criteria.conditions,
    };

    const updateConfigBody = {
      mode: ApiMode.UPDATE,
      configName: config.BANNER_CONFIG,
      configValue,
      status: status.ACTIVE,
      dataType: DataType.JSON,
    };

    await Promise.all([
      this.apiPosService.updateTblConfig(updateConfigBody),
      this.configService.clearCache(FETCH_BANNER_CACHE_KEY, false),
    ]);
  }
}

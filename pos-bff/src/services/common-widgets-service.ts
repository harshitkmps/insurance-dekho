import { Injectable, Logger } from "@nestjs/common";
import { ID_EXCLUSIVE_BANNERS_LIMIT } from "../constants/homepage.constants";
import BannerService from "./banner-service";
import CommonApiHelper from "./helpers/common-api-helper";
import CommonUtils from "../utils/common-utils";
import { ConfigService } from "@nestjs/config";

@Injectable()
export default class CommonWidgetsService {
  constructor(
    private apiHelper: CommonApiHelper,
    private bannerService: BannerService,
    private configService: ConfigService
  ) {}

  public async getFrontendContent(params: any): Promise<any> {
    try {
      const baseUrl = await this.configService.get(
        "COMMON_WIDGETS_ENDPOINT_S2S"
      );
      const options = {
        endpoint: `${baseUrl}/content`,
        config: {
          timeout: 5000,
        },
      };
      Logger.debug("get frontend content request", { params });
      const frontendContentData: any = await this.apiHelper.fetchData(
        options,
        params
      );
      if (!frontendContentData.content?.length) {
        Logger.debug("empty frontend content response");
      }
      return frontendContentData.content;
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in get frontend content", { error });
      return [];
    }
  }

  public async getHomepageBanners(
    queryParams: any,
    isBannersEnabled: Boolean,
    userDetails: any,
    currDate: string,
    requestOrigin: string
  ): Promise<any> {
    const bannerConfig = [];
    const userContentParams = {
      targetLOBs: queryParams.product,
      typeOfContent: "banner",
      active: true,
    };

    const idExclusiveBanners = isBannersEnabled
      ? await this.getFrontendContent(userContentParams)
      : [];

    for (const content of idExclusiveBanners) {
      if (bannerConfig.length >= ID_EXCLUSIVE_BANNERS_LIMIT) {
        break;
      }
      const banner = this.bannerService.mapObjToBanner(content);
      const shouldShowBanner = await this.bannerService.checkBannerVisibility(
        banner,
        userDetails,
        currDate
      );
      if (!shouldShowBanner) {
        continue;
      }
      const bannerInfo = {
        link: banner?.links?.web,
        cta:
          requestOrigin === process.env.POS_MEDIUM
            ? banner?.cta?.web
            : banner?.cta?.app,
      };
      bannerConfig.push(bannerInfo);
    }
    return bannerConfig;
  }

  public async addFrontendContent(body: object): Promise<any> {
    const baseUrl = await this.configService.get("COMMON_WIDGETS_ENDPOINT_S2S");
    const options = {
      endpoint: `${baseUrl}/content`,
    };
    Logger.debug("add frontend content request body", { params: body });
    const frontendContentData: any = await this.apiHelper.postData(
      options,
      body
    );
    if (!frontendContentData?.contentDetails) {
      Logger.debug("empty frontend content response");
    }
    return frontendContentData.contentDetails;
  }

  public async updateFrontendContent(
    bannerId: string,
    body: object
  ): Promise<any> {
    const baseUrl = await this.configService.get("COMMON_WIDGETS_ENDPOINT_S2S");
    const options = {
      endpoint: `${baseUrl}/content/${bannerId}`,
    };
    Logger.debug("update frontend content request body", { body });
    const frontendContentData: any = await this.apiHelper.putData(
      options,
      body
    );
    return frontendContentData.data;
  }
}

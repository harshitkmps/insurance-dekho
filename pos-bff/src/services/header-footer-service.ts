import { config } from "../constants/config.constants";
import ConfigService from "./config-service";
import PointsManagementService from "./points-management-service";
import { Injectable } from "@nestjs/common";

@Injectable()
export default class HeaderFooterService {
  constructor(
    private pointsManagementService: PointsManagementService,
    private configService: ConfigService
  ) {}

  public async getHeaderFooter(
    userInfo: any,
    requestOrigin: string
  ): Promise<any> {
    const [{ showScoreHeader, dealerDetails }, headerFooterConfig] =
      await Promise.all([
        this.pointsManagementService.checkScoreHeaderVisible(userInfo),
        this.configService.getConfigValueByKey(config.HEADER_FOOTER),
      ]);
    const userHeader = headerFooterConfig.user;
    const moreFooter = headerFooterConfig.more;
    const userDetails = { ...userInfo, ...dealerDetails?.[0] };
    if (userDetails?.tenant_id === 0 || userDetails?.tenant_id === null) {
      userDetails.tenant_id = 1;
    }

    const [headerRes, footerRes] = [
      this.configService.checkConfigArrOfConditions(
        userHeader,
        userDetails,
        requestOrigin
      ),
      this.configService.checkConfigArrOfConditions(
        moreFooter,
        userDetails,
        requestOrigin
      ),
    ];

    return {
      header: headerRes,
      footer: footerRes,
      showScoreHeader,
    };
  }
}

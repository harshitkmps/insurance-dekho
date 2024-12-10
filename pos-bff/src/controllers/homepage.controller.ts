import HomepageService from "../services/homepage-service";
import { sendResponse } from "../services/helpers/response-handler";
import CommonUtils from "../utils/common-utils";
import { Controller, Get, Req, Res, Logger } from "@nestjs/common";
import CaseListingService from "../services/case-listing-v2-service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { Response } from "express";

@Controller("/v1/homepage")
@ApiTags("Homepage")
export class HomepageController {
  constructor(
    public homepageService: HomepageService,
    public caseCountService: CaseListingService
  ) {}

  @Get("/config")
  @UserAuth()
  @ApiOperation({
    summary: "Get homepage post login config from TBL Config",
  })
  async getConfig(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const userInfo = req.userInfo;
      const query = req.query;
      const requestOrigin =
        req.headers.origin === process.env.X_FORWAREDED_POS_APP_HOST ||
        req.headers["x-hostname"] === process.env.X_FORWAREDED_POS_APP_HOST
          ? process.env.APP_MEDIUM
          : process.env.POS_MEDIUM;
      Logger.debug("homepage config get API request", {
        query,
        tenantId: userInfo.tenant_id,
        mobile: userInfo.mobile,
        requestOrigin,
        xHostName: req.headers["x-hostname"],
        xForwardedPostHost: process.env.X_FORWAREDED_POS_APP_HOST,
      });

      const config = await this.homepageService.getHomepageConfig(
        userInfo,
        requestOrigin,
        query
      );

      return sendResponse(req, res, 200, "ok", config);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in homepage config API", {
        error,
        leadId: req.body.leadId || req.body.visit_id,
        product: req.body.product,
        vehicleType: req.body.vehicleCategory || req.body.vehicleType || null,
      });
      return sendResponse(
        req,
        res,
        err?.response?.status || err.status || 500,
        "error",
        error?.response || err
      );
    }
  }
}

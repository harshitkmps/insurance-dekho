import { Controller, Get, Post, Req, Res } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { sendResponse } from "../services/helpers/response-handler";
import CommonUtils from "../utils/common-utils";
import PartnerListingService from "../services/partner-listing-service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { Response } from "express";

@Controller("/v1/partner-listing")
@ApiTags("Partner Listing")
export class PartnerListingController {
  constructor(private partnerListingService: PartnerListingService) {}

  @Get("/config")
  @UserAuth()
  @ApiOperation({
    summary: "fetch config for partner listing page",
  })
  async getPartnerListingConfig(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const userInfo = req.userInfo;
      const requestOrigin =
        req.headers.origin === process.env.X_FORWAREDED_POS_HOST ||
        req.headers["x-hostname"] === process.env.X_FORWAREDED_POS_HOST
          ? process.env.POS_MEDIUM
          : process.env.APP_MEDIUM;
      Logger.debug("partner listing config get API request", {
        tenantId: userInfo.tenant_id,
        mobile: userInfo.mobile,
        requestOrigin,
        xHostName: req.headers["x-hostname"],
        xForwardedPostHost: process.env.X_FORWAREDED_POS_HOST,
      });

      const config = await this.partnerListingService.getPartnerListingConfig(
        userInfo,
        requestOrigin
      );
      return sendResponse(req, res, 200, "ok", config);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in partner listing fetch config", {
        error,
        leadId: req.query.leadId,
        uuid: req.userInfo?.uuid,
        dealerId: req.query?.dealerId,
      });
      return sendResponse(
        req,
        res,
        err?.status || err?.response?.status || 500,
        "error",
        error?.response || error
      );
    }
  }

  @Post("/fetch-data")
  @UserAuth()
  async getPartnerListingData(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const userInfo = req.userInfo;
      const reqBody = {
        filters: req.body?.params,
        limit: req.body?.limit,
        offset: req.body?.offset,
        isFetchHierarchy: req.body?.isFetchHierarchy,
        isRenewalDashboard: req.body?.isRenewalDashboard,
      };
      if (req.body?.lob) {
        reqBody["lob"] = req.body?.lob;
      }
      if (req.body?.dropOffValue) {
        reqBody["dropOffValue"] = req.body?.dropOffValue;
      }
      if (req.body?.uuid && req.body?.designationId) {
        reqBody["uuid"] = req.body?.uuid;
        reqBody["designationId"] = req.body?.designationId;
      }
      if (req.body?.isPmtd) {
        reqBody["isPmtd"] = true;
      }
      if (req.body?.teamUuid) {
        reqBody["teamUuid"] = req.body?.teamUuid;
      }
      const requestOrigin =
        req.headers.origin === process.env.X_FORWAREDED_POS_HOST ||
        req.headers["x-hostname"] === process.env.X_FORWAREDED_POS_HOST
          ? process.env.POS_MEDIUM
          : process.env.APP_MEDIUM;
      Logger.debug("partner listing data get API request", {
        tenantId: userInfo.tenant_id,
        mobile: userInfo.mobile,
        requestOrigin,
        xHostName: req.headers["x-hostname"],
        xForwardedPostHost: process.env.X_FORWAREDED_POS_HOST,
      });

      const data = await this.partnerListingService.getPartnerListingData(
        userInfo,
        reqBody
      );
      return sendResponse(req, res, 200, "ok", data);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in partner listing fetch data", {
        error,
        leadId: req.query.leadId,
        uuid: req.userInfo?.uuid,
        dealerId: req.query?.dealerId,
      });
      return sendResponse(
        req,
        res,
        err?.status || err?.response?.status || 500,
        "error",
        error?.response || error
      );
    }
  }
}

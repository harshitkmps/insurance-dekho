import { ApiOperation, ApiTags } from "@nestjs/swagger";
import DashboardService from "../services/dashboard-service";
import { sendResponse } from "../services/helpers/response-handler";
import CommonUtils from "../utils/common-utils";
import {
  Req,
  Res,
  Get,
  Controller,
  Post,
  Logger,
  Query,
  Param,
  Body,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { PosInternalRoles } from "../constants/pos-roles.constants";
import { GetPartnerBaseCohortsDto } from "../dtos/dashboard/get-partner-base-cohorts.dto";
import { GetPartnerBaseDealersDto } from "../dtos/dashboard/get-partner-base-dealers.dto";
import { GetSalesTrendsDto } from "../dtos/dashboard/get-sales-trends.dto";
import { GetSinglePartnerStatsDto } from "../dtos/dashboard/get-single-partner-stats.dto";
import { SalesHierarchyAuth } from "../decorators/sales-hierarchy-auth.decorator";
import { DealerHierarchyAuth } from "../decorators/dealer-hierarchy-auth.decorator";
import { DownloadPartnerBaseDto } from "../dtos/dashboard/download-partner-base.dto";

@Controller("/v1/dashboard")
@ApiTags("Dashboard")
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get("/config")
  @UserAuth()
  @ApiOperation({
    summary: "Fetch dashboard configuration",
  })
  async getDashboardConfig(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const userInfo = req.userInfo;
      const query = req.query;
      const requestOrigin =
        req.headers.origin === process.env.X_FORWAREDED_POS_HOST ||
        req.headers["x-hostname"] === process.env.X_FORWAREDED_POS_HOST
          ? process.env.POS_MEDIUM
          : process.env.APP_MEDIUM;
      Logger.debug("dashboard config get API request", {
        query,
        tenantId: userInfo.tenant_id,
        mobile: userInfo.mobile,
        requestOrigin,
        xHostName: req.headers["x-hostname"],
        xForwardedPostHost: process.env.X_FORWAREDED_POS_HOST,
      });

      const config = await this.dashboardService.getDashboardConfig(
        userInfo,
        requestOrigin
      );
      return sendResponse(req, res, 200, "ok", config);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error(`Error while fetching dashboard config: ${error}`);
      return sendResponse(
        req,
        res,
        err?.response?.status || err.status || 500,
        "error",
        error?.response || err
      );
    }
  }

  @Post("/fetch-data")
  @UserAuth()
  @ApiOperation({
    summary: "Fetch dashboard data api",
  })
  async fetchDashboardData(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    try {
      Logger.debug("Inside fetch dashboard data", request.body);
      let res: any;
      if (request.body.fetchSalesHirerchy) {
        res = await this.dashboardService.fetchHierarchyTargetData(
          request.body,
          request.userInfo
        );
      } else {
        res = await this.dashboardService.fetchDashboardData(
          request.body,
          request.userInfo
        );
      }

      return sendResponse(request, response, 200, "ok", res);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error(`Error while fetching dashboard data: ${error}`);
      return sendResponse(
        request,
        response,
        err?.response?.status || err.status || 500,
        "error",
        error?.response ?? error
      );
    }
  }

  @Post("/nop-data")
  @UserAuth()
  async fetchNopData(@Req() request: ReqWithUser, @Res() response: Response) {
    try {
      Logger.debug("Inside fetch dashboard data", request.body);
      const res = await this.dashboardService.fetchNopData(
        request.body,
        request.userInfo
      );

      Logger.debug("Sending following response for NOP data", res);
      return sendResponse(request, response, 200, "ok", res);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error(`Error while fetching NOP data: ${error}`);
      return sendResponse(
        request,
        response,
        err?.response?.status || err.status || 500,
        "error",
        error?.response || error
      );
    }
  }

  @Post("/sales")
  @SalesHierarchyAuth({ uuidPath: "body.uuid", teamUuidPath: "body.teamUuid" })
  @UserAuth(...PosInternalRoles)
  async getSalesData(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const data = await this.dashboardService.fetchSalesUserData(
        req.body,
        req.userInfo
      );
      return sendResponse(req, res, 200, "ok", data);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in fetching sales data", {
        error,
        leadId: req.query.leadId,
        uuid: req.userInfo?.uuid,
        dealerId: req.query?.dealerId,
      });
      return sendResponse(
        req,
        res,
        err?.response?.status || err.status || 500,
        "error",
        error?.response || error
      );
    }
  }

  @Post("/business")
  @SalesHierarchyAuth({ uuidPath: "body.uuid", teamUuidPath: "body.teamUuid" })
  @UserAuth(...PosInternalRoles)
  @ApiOperation({
    summary: "Fetch net business data",
  })
  async getNetBusiness(@Req() req: ReqWithUser, @Res() res: Response) {
    const data = await this.dashboardService.fetchNetBusiness(
      req.body,
      req.userInfo
    );
    return sendResponse(req, res, 200, "ok", data);
  }

  @Get("/partner-base/cohorts")
  @SalesHierarchyAuth({
    uuidPath: "query.uuid",
    teamUuidPath: "query.teamUuid",
  })
  @UserAuth(...PosInternalRoles)
  @ApiOperation({
    summary: "Get Partner Base cohorts stats",
  })
  async getPartnerBaseCohorts(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Query() query: GetPartnerBaseCohortsDto
  ) {
    const data = await this.dashboardService.getPartnerBaseCohorts(
      query,
      req.userInfo
    );
    return sendResponse(req, res, 200, "ok", data);
  }

  @Get("/partner-base/dealers")
  @SalesHierarchyAuth({
    uuidPath: "query.uuid",
    teamUuidPath: "query.teamUuid",
  })
  @UserAuth(...PosInternalRoles)
  @ApiOperation({
    summary: "Get Partner Base dealers list",
  })
  async getPartnerBaseDealers(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Query() query: GetPartnerBaseDealersDto
  ) {
    const data = await this.dashboardService.getPartnerBaseDealers(
      query,
      req.userInfo
    );
    return sendResponse(req, res, 200, "ok", data);
  }

  @Post("/partner-base/dealers/download")
  @SalesHierarchyAuth({
    uuidPath: "body.uuid",
    teamUuidPath: "body.teamUuid",
  })
  @UserAuth(...PosInternalRoles)
  @ApiOperation({
    summary: "Trigger Partner Base dealers download to utility service",
  })
  async downloadPartnerBaseDealers(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Body() body: DownloadPartnerBaseDto
  ) {
    try {
      const data = await this.dashboardService.downloadPartnerBaseDealers(
        body,
        req.userInfo
      );
      return sendResponse(req, res, 200, "ok", data);
    } catch (err) {
      const rawError = CommonUtils.isJsonString(err);
      Logger.error("error in partner base download", { error: rawError });
      return sendResponse(
        req,
        res,
        err?.response?.status || err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "unable to download the report",
        {}
      );
    }
  }

  @Get("/partner-base/dealers/:dealerUuid")
  @DealerHierarchyAuth({
    uuidPath: "params.dealerUuid",
    teamUuidPath: "query.teamUuid",
  })
  @UserAuth(...PosInternalRoles)
  @ApiOperation({
    summary: "Get Single Dealer Stats",
  })
  async getSingleDealerStats(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Param("dealerUuid") dealerUuid: string,
    @Query() query: GetSinglePartnerStatsDto
  ) {
    const data = await this.dashboardService.getSinglePartnerStats(
      query,
      req.userInfo,
      dealerUuid
    );
    return sendResponse(req, res, 200, "ok", data);
  }

  @Get("/trend/sales")
  @SalesHierarchyAuth({
    uuidPath: "query.uuid",
    teamUuidPath: "query.teamUuid",
  })
  @UserAuth(...PosInternalRoles)
  @ApiOperation({
    summary: "Get Sales stats based on view",
  })
  async getSalesTrends(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Query() query: GetSalesTrendsDto
  ) {
    const data = await this.dashboardService.getSalesUserTrend(
      query,
      req.userInfo
    );
    return sendResponse(req, res, 200, "ok", data);
  }
}

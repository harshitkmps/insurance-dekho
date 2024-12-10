import { Controller, Get, Req, Res } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { sendResponse } from "../services/helpers/response-handler";
import TenantService from "../services/tenant-service";
import { Response } from "express";
import CommonUtils from "../utils/common-utils";
import MasterAPIService from "../services/master-service";
import { PosRoles } from "../constants/pos-roles.constants";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";

@Controller("/v1/tenant")
@ApiTags("Tenant")
export class TenantController {
  constructor(
    private tenantService: TenantService,
    private masterApiService: MasterAPIService
  ) {}

  @Get("/source")
  @UserAuth()
  @ApiOperation({
    summary: "Return source, sub-source for user on the basis of tenant id",
  })
  async getTenant(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      Logger.debug("get source sub-source API", {
        body: req.body,
        query: req.query,
      });
      const tenantInfo = await this.tenantService.getTenantDetailsFromMaster(
        req.userInfo,
        req.query
      );
      return sendResponse(req, res, 200, "OK", tenantInfo);
    } catch (err) {
      Logger.error("error in get tenant API", { err });
      return res
        .status(err?.response?.status || err.status)
        .json({ err: err?.response || err });
    }
  }

  @UserAuth()
  @Get("/list")
  @ApiOperation({
    summary: "Get tenant list from master API",
  })
  async getTenantsList(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      Logger.debug("get tenant list API controller", { params: req.query });
      const query = req.query;
      const userInfo = req.userInfo;
      const loginMode = query?.getLoginMode === "true";
      const tenantsList = await this.masterApiService.getTenantDetails();
      if (loginMode) {
        const tenants: any[] = tenantsList.tenant
          .map((tenant: any) => ({
            id: tenant.id,
            name: tenant.name,
            loginMode: tenant.login_mode,
          }))
          .filter((tenant: any) =>
            tenant.id === Number(userInfo.tenant_id) ? tenant : null
          );
        return sendResponse(req, res, 200, "ok", tenants);
      }
      const tenants: any[] = tenantsList.tenant.map((tenantDetails: any) => ({
        id: tenantDetails.id,
        name: tenantDetails.name,
      }));
      return sendResponse(req, res, 200, "ok", { tenants });
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in get tenant list API", {
        error,
      });
      return sendResponse(
        req,
        res,
        error?.response?.status || err.status || 500,
        "error",
        error?.response || error
      );
    }
  }

  @Get("/user-config")
  @UserAuth(PosRoles.SuperAdmin, PosRoles.Agent)
  @ApiOperation({
    summary: "Get tenant list from master API based on user's role id",
  })
  public async getUserConfigBasedTenantList(
    @Req() req: ReqWithUser,
    @Res() res: Response
  ) {
    try {
      Logger.debug("get user config tenant list API controller", {
        params: req.query,
      });
      const userInfo = req.userInfo;
      const result = await this.tenantService.getUserBasedTenantConfig(
        userInfo
      );
      return sendResponse(req, res, 200, "ok", result);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in get tenant user config API", {
        error,
      });
      return sendResponse(
        req,
        res,
        err?.response?.status || 500,
        "error",
        error?.response
      );
    }
  }
}

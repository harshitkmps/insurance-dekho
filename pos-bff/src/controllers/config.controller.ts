import { ApiOperation, ApiTags } from "@nestjs/swagger";
import ConfigService from "../services/config-service";
import HeaderFooterService from "../services/header-footer-service";
import { sendResponse } from "../services/helpers/response-handler";
import CommonUtils from "../utils/common-utils";
import { Controller, Get, Req, Res, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";

@Controller("/v1/config")
@ApiTags("Config")
export class ConfigController {
  constructor(
    public configService: ConfigService,
    public headerFooterService: HeaderFooterService
  ) {}

  @Get("/clear-cache-by-key")
  @ApiOperation({
    summary: "Clears config cache in redis",
    parameters: [
      {
        name: "cacheKey",
        in: "query",
        example: "__cacheKey__getConfigFromDb__",
      },
      {
        name: "exactMatch",
        in: "query",
        example: "true/false",
      },
    ],
  })
  async clearCacheByKey(@Req() request: any, @Res() response: any) {
    const exactMatch = request.query?.exactMatch === "true";
    const { cacheCleared, msg } = await this.configService.clearCache(
      request.query.cacheKey,
      exactMatch
    );
    if (!cacheCleared) {
      return sendResponse(request, response, 400, "Bad Request", msg);
    }
    return sendResponse(request, response, 200, "ok", msg);
  }

  @Get("/header-footer")
  @UserAuth()
  @ApiOperation({
    summary: "Get header footer from tbl config",
  })
  async getHeaderFooter(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const userInfo = req.userInfo;
      const requestOrigin =
        req.headers.origin === process.env.X_FORWAREDED_POS_HOST ||
        req.headers["x-hostname"] === process.env.X_FORWAREDED_POS_HOST ||
        req.headers.origin === process.env.X_FORWAREDED_POS_IDEDGE_HOST ||
        req.headers["x-hostname"] === process.env.X_FORWAREDED_POS_IDEDGE_HOST
          ? process.env.POS_MEDIUM
          : process.env.APP_MEDIUM;

      const data = await this.headerFooterService.getHeaderFooter(
        userInfo,
        requestOrigin
      );

      return sendResponse(req, res, 200, "ok", data);
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
        err?.response?.status || err?.status || 500,
        "error",
        error?.response
      );
    }
  }

  @Get("")
  @ApiOperation({
    summary: "Get config based on key",
  })
  // NOTE: Not to be called from FE, only to be used for internal purpose
  async getConfig(@Req() req: Request, @Res() res: Response) {
    try {
      const query = req.query;
      const cacheKey = query.cacheKey as string;
      if (cacheKey) {
        const data = await this.configService.getConfigValueByKey(cacheKey);
        return sendResponse(req, res, 200, "ok", data);
      }
      return this.configService.getConfigFromDb();
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in config API", {
        error,
      });
      return sendResponse(
        req,
        res,
        err?.response?.status || err?.status || 500,
        "error",
        error?.response
      );
    }
  }
}

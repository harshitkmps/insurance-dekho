import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PosRoles } from "../constants/pos-roles.constants";
import BannerService from "../services/banner-service";
import CommonWidgetsService from "../services/common-widgets-service";
import { sendResponse } from "../services/helpers/response-handler";
import CommonUtils from "../utils/common-utils";
import { Controller, Req, Res, Get, Post, Put, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import { UserAuth } from "../decorators/user-auth.decorator";

@Controller("/v1/content")
@ApiTags("Frontend Content")
export class FrontendContentController {
  constructor(
    private commonWidgetsService: CommonWidgetsService,
    private bannerService: BannerService
  ) {}

  @Post("/add")
  @UserAuth(PosRoles.Admin, PosRoles.SuperAdmin)
  @ApiOperation({
    summary: "Add Frontend Content From Admin Panel to common widgets backend",
    requestBody: {
      description: "Add Frontend Content to frontend content collection",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              typeOfContent: "banner",
              contentProps: {
                cta: {
                  web: "",
                  app: "",
                },
                links: {
                  web: "https://insurance-b2c-assets.s3.ap-south-1.amazonaws.com/assets/SP1.png",
                  app: "https://insurance-b2c-assets.s3.ap-south-1.amazonaws.com/assets/SA1.png",
                },
              },
              criteria: {
                conditions: [
                  {
                    type: "array",
                    key: "pos_role_id",
                    value: [1, 2, 3],
                    match: true,
                  },
                  {
                    type: "array",
                    key: "tenant_id",
                    value: [1],
                    match: true,
                  },
                  {
                    type: "array",
                    key: "refer_dealer_id",
                    value: [null],
                    match: false,
                  },
                  {
                    type: "array",
                    key: "channel_partner_sub_type",
                    value: ["1"],
                    match: true,
                  },
                  {
                    type: "array",
                    key: "onboarded_on_life",
                    value: [0],
                    match: true,
                  },
                ],
                dateRange: {
                  to: "2023-03-20",
                  from: "2023-03-13",
                },
              },
              targetLOBs: ["POS"],
            },
          },
        },
      },
    },
  })
  async addContent(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug("add FE content API frontend controller", {
        body: req.body,
      });
      const reqBody = { ...req.body };
      const content = await this.commonWidgetsService.addFrontendContent(
        reqBody
      );
      if (reqBody?.contentProps?.loginBanner) {
        await this.bannerService.updateBannerConfig(reqBody);
      }
      return sendResponse(req, res, 200, "ok", { content });
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in add frontend controller API", {
        error,
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

  @Get("/fetch")
  @UserAuth(PosRoles.Admin, PosRoles.SuperAdmin)
  @ApiOperation({
    summary: "Get Frontend Content For Admin Panel from common widgets backend",
  })
  async getContent(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug("get FE content banners API frontend controller", {
        query: req.query,
      });
      const query = {
        active: req.query.active,
        targetLOBs: req.query.targetLOBs,
        typeOfContent: req.query.typeOfContent,
      };
      const content = await this.commonWidgetsService.getFrontendContent(query);
      return sendResponse(req, res, 200, "ok", { content });
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in get frontend controller API", {
        error,
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

  @Put("/update/:id")
  @UserAuth(PosRoles.Admin, PosRoles.SuperAdmin)
  @ApiOperation({
    summary:
      "Update Frontend Content from Admin Panel to common widgets backend",
  })
  async updateContent(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug("update FE content banners API frontend controller", {
        query: req.query,
      });
      const reqBody = { ...req.body };
      const msg = await this.commonWidgetsService.updateFrontendContent(
        req.params.id,
        reqBody
      );
      if (reqBody?.contentProps?.loginBanner) {
        await this.bannerService.updateBannerConfig(reqBody);
      }
      return sendResponse(req, res, 200, "ok", { msg });
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in update frontend controller API", {
        error,
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
}

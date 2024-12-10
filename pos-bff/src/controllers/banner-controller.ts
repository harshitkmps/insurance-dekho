import { sendResponse } from "../services/helpers/response-handler";
import { Response } from "express";
import { Get, Res, Req, Controller, Logger } from "@nestjs/common";
import BannerService from "../services/banner-service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";

@Controller("/v1")
@ApiTags("Banner")
export class BannerController {
  constructor(private bannerService: BannerService) {}

  @Get("/banner")
  @UserAuth()
  @ApiOperation({
    summary: "return the banner configs",
  })
  async banner(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const userInfo = req.userInfo;
      const category = req?.query?.categoryId;
      const result = await this.bannerService.fetchBanner(
        userInfo,
        userInfo.mobile,
        category
      );
      return sendResponse(req, res, 200, "ok", result);
    } catch (err) {
      Logger.error("error in banner API : ", err);
      const error = { error: err?.response, success: false };
      return sendResponse(req, res, 500, "error", error);
    }
  }
}

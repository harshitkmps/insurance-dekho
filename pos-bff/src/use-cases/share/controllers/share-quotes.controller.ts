import { sendResponse } from "../../../services/helpers/response-handler";
import { Controller, Post, Req, Res, Logger } from "@nestjs/common";
import { Response } from "express";
import CommonUtils from "../../../utils/common-utils";
import ShareQuotesService from "../services/share-quotes.service";
import { UserAuth } from "@/src/decorators/user-auth.decorator";
import { ApiOperation } from "@nestjs/swagger";
import { ReqWithUser } from "@/src/interfaces/request/req-with-user.interface";

@Controller("/v1/quotes")
export class ShareQuotesController {
  constructor(private shareQuotesService: ShareQuotesService) {}

  @Post("/share")
  @UserAuth()
  @ApiOperation({
    summary: "hit share quotes API of LMW",
  })
  async getAgentDetails(@Req() req: ReqWithUser, @Res() res: Response) {
    const body = req.body;
    try {
      Logger.debug("share quotes request received", { body });
      const data = await this.shareQuotesService.shareQuotes(body);
      return sendResponse(req, res, 200, "ok", data);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error(`error in quotes sharing url ${body.leadId}`, {
        error,
        uuid: req.userInfo?.uuid,
        dealerId: req.query?.dealerId,
      });
      return res
        .status(err?.response?.status || err.status || 500)
        .json(err?.response?.message || err.message);
    }
  }
}

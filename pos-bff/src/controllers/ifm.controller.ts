import { sendResponse } from "../services/helpers/response-handler";
import IFMApiService from "../services/ifm-service";
import CommonUtils from "../utils/common-utils";
import { Logger } from "@nestjs/common";
import { Response } from "express";
import { Controller, Get, Req, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";

@Controller("/v1/ifm")
@ApiTags("IFM")
export class IFMController {
  constructor(private ifmService: IFMApiService) {}

  @Get("/gridpoint-url")
  @UserAuth()
  @ApiOperation({
    summary: "Get redirection url to gridpoint",
  })
  async getRedirectionUrl(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const mobile = req.userInfo?.mobile;
      const ott = await this.ifmService.getOttFromIfmGateway(mobile);
      const gridpointUrl =
        process.env.GRIDPOINT_ENDPOINT + "/ott-gp?one-time-token=" + ott;
      return sendResponse(req, res, 302, "OK", { url: gridpointUrl });
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in ifm get redirection url", {
        error,
        leadId: req.query.leadId,
        uuid: req.userInfo?.uuid,
        dealerId: req.query?.dealerId,
      });
      return res
        .status(err?.response?.status || err.status || 500)
        .json(err.response);
    }
  }
}

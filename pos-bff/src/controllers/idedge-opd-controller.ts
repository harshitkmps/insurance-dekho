// import authMiddleware from "../middlewares/auth.middleware";
import { sendResponse } from "../services/helpers/response-handler";
import IDEdgeApiService from "../services/idedge-opd-service";
import CommonUtils from "../utils/common-utils";
import { Logger } from "@nestjs/common";
import { Response } from "express";
import { Controller, Get, Req, Res } from "@nestjs/common";
import { REDIRECTION_MAPPING_URL } from "../constants/otherproducts.constants";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";

@Controller("/v1/opd-idedge")
@ApiTags("Opd ID Edge")
export class IDEdgeOpdController {
  constructor(private idedgeService: IDEdgeApiService) {}

  @Get("/idedge-url")
  @ApiOperation({
    summary: "Get redirection url to idedge",
  })
  async getRedirectionUrl(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const lobMapping = REDIRECTION_MAPPING_URL[req?.query?.lobKey as string];
      const mobile = req.userInfo?.mobile;
      const authToken = req.headers.authorization
        ? req.headers.authorization.replace("Bearer", "").split(".")[2]
        : null;
      const ott = await this.idedgeService.getOttForIdEdgeGateway(
        authToken,
        mobile
      );
      Logger.debug("Idegde ott token", { ott });
      const idEdgeUrl =
        // process.env.POS_UI_ENDPOINT +
        process.env.POS_IDEDGE_ENDPOINT +
        "ott-pos-opd?one-time-token=" +
        ott +
        `&referer_url=${lobMapping}`;
      return sendResponse(req, res, 302, "OK", { url: idEdgeUrl });
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in idedge get redirection url", {
        error,
        leadId: req.query.leadId,
        uuid: req.userInfo?.uuid,
        dealerId: req.query?.dealerId,
      });
      return sendResponse(req, res, 400, "unable to fetch the link", {});
    }
  }
}

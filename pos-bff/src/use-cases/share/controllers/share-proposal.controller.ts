import { sendResponse } from "../../../services/helpers/response-handler";
import { Controller, Post, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { Logger } from "@nestjs/common";
import CommonUtils from "../../../utils/common-utils";
import ShareProposalService from "../services/share-proposal.service";
import { UserAuth } from "@/src/decorators/user-auth.decorator";
import { ApiOperation } from "@nestjs/swagger";
import { ReqWithUser } from "@/src/interfaces/request/req-with-user.interface";

@Controller("/v1/proposal")
export class ShareProposalController {
  constructor(private shareProposalService: ShareProposalService) {}

  @Post("/share")
  @UserAuth()
  @ApiOperation({
    summary: "hit share quotes API of LMW",
  })
  async getAgentDetails(@Req() req: ReqWithUser, @Res() res: Response) {
    const body = req.body;
    try {
      if (!body.product) {
        return sendResponse(req, res, 400, "error", {
          message: "Product is required",
        });
      }
      const reqSource =
        req.headers.origin === process.env.X_FORWAREDED_POS_APP_HOST ||
        req.headers["x-hostname"] === process.env.X_FORWAREDED_POS_APP_HOST
          ? process.env.APP_MEDIUM
          : process.env.POS_MEDIUM;
      Logger.debug("share proposal controller req params", {
        body,
        reqSource,
      });
      const data = await this.shareProposalService.shareProposal(
        body,
        req.headers
      );
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

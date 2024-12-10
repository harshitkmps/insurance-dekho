import { Request, Response } from "express";
import { Controller, Logger, Post, Req, Res } from "@nestjs/common";
import { sendResponse } from "../services/helpers/response-handler";
import CommonUtils from "../utils/common-utils";
import LifeLeadService from "../services/life-lead.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller("/v1/life-lead")
@ApiTags("Life Lead")
export class LifeLeadController {
  constructor(private lifeLeadService: LifeLeadService) {}

  @Post()
  @ApiOperation({
    summary: "Create Lead details to LMW",
  })
  async createLead(@Req() req: Request, @Res() res: Response) {
    try {
      const body = req.body;
      Logger.debug("creating life lead details params", { body });
      const data = await this.lifeLeadService.createLead(body);
      return sendResponse(req, res, 200, "ok", data);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in create lead life", {
        error,
        userId: req.body.user_id,
      });
      return res
        .status(err?.response?.status || err.status || 500)
        .json({ message: err.response });
    }
  }
}

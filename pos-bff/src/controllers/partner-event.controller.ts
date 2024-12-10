import { UserAuth } from "@/src/decorators/user-auth.decorator";
import { ReqWithUser } from "@/src/interfaces/request/req-with-user.interface";
import { sendResponse } from "@/src/services/helpers/response-handler";
import { Controller, Get, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import PartnerEventService from "../services/partner-event.service";

@Controller("/v1/partner-event")
@ApiTags("Partner Event")
export class PartnerEventController {
  constructor(private partnerEventService: PartnerEventService) {}

  @Get("/config")
  @UserAuth()
  @ApiOperation({
    summary: "Get configuration for motor-offline pages",
  })
  async getConfig(@Req() req: ReqWithUser, @Res() res: Response) {
    const data = await this.partnerEventService.getEventConfig(req.query);
    return sendResponse(req, res, 200, "event config fetched", data);
  }
}

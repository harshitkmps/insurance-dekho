import { Request, Response } from "express";
import { Controller, Get, Logger, Post, Req, Res } from "@nestjs/common";
import { sendResponse } from "../services/helpers/response-handler";
import AgentProfileService from "../services/agent-profile-service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";

@Controller()
@ApiTags("Agent Profile")
export class AgentProfileController {
  constructor(private agentProfileService: AgentProfileService) {}

  @Get("/agents/:profileId")
  @ApiOperation({
    summary: "Fetch field validation config to view the dealer properties",
  })
  async getAgentDetails(@Req() req: Request, @Res() res: Response) {
    //get gcd_code,uuid from the
    Logger.debug("Received following params", req.params);
    const response = await this.agentProfileService.getAgentDetails(req);
    Logger.debug("Sending following response for profile id", response);
    return sendResponse(req, res, 200, "ok", response);
  }

  @Get("/qrcodes")
  @UserAuth()
  @ApiOperation({
    summary: "Fetch user properties from cps based on the cps_id",
  })
  async getQrCode(@Req() req: ReqWithUser, @Res() res: Response) {
    Logger.debug("Received following request params for qrcode", req.body);
    const response = await this.agentProfileService.fetchQrCode(req);
    Logger.debug("Sending qr code with following response", response);
    return sendResponse(req, res, 200, "ok", response);
  }

  @Post("/agents/communication")
  @UserAuth()
  @ApiOperation({
    summary: "Update dealer properties based on cps id",
  })
  async shareProfile(@Req() req: ReqWithUser, @Res() res: Response) {
    Logger.debug("Sharing profile with following body", req.body);
    const body = req.body,
      headers = req.headers;
    const response = await this.agentProfileService.shareProfile(
      body,
      headers,
      req.userInfo
    );
    Logger.debug("Response from communication service", response);
    return sendResponse(req, res, 200, "ok", response);
  }

  @Get("/agent/certificate")
  @UserAuth()
  @ApiOperation({
    summary: "Fetch basic details skeleton",
  })
  async getAgentCertificates(@Req() req: ReqWithUser, @Res() res: Response) {
    Logger.debug("Fetching agent certificate", req.body);
    const userInfo = req.userInfo;
    const certificateType: string = (req.query.certificate ?? "") as string;
    const gcdCode = userInfo?.gcd_code;
    const response = await this.agentProfileService.getCertificate(
      gcdCode,
      certificateType
    );
    Logger.debug("Response from agent certicates ", response?.data);
    return sendResponse(req, res, 200, "ok", response);
  }
}

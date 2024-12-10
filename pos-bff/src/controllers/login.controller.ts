import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { sendResponse } from "../services/helpers/response-handler";
import { Controller, Get, Req, Res } from "@nestjs/common";
import { LeadAuth } from "../decorators/lead-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { Response } from "express";

@Controller()
@ApiTags("Login")
export class LoginController {
  @Get(["/v2/login", "/v3/login"])
  // v3/login should not be used in new developments. To be removed in future
  @LeadAuth()
  @ApiOperation({ summary: "Fetch login details of a user" })
  async fetchLoginDetailsv2(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const loginDetails = request?.userInfo;
    loginDetails.newOnboarding = process.env.NEW_ONBOARDING;
    return sendResponse(
      request,
      response,
      200,
      "Login details fetched successfully",
      loginDetails
    );
  }
}

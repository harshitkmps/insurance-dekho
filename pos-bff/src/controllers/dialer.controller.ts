import { Body, Controller, Get, Post, Query, Req, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { PosRoles } from "../constants/pos-roles.constants";
import { DialerSetCallbackRequestDto } from "../dtos/request/common-request.dto";
import ApiPosService from "../services/apipos-service";
import { sendResponse } from "../services/helpers/response-handler";
import { Response } from "express";

@ApiTags("Dialer APIs")
@Controller("/dialer")
export class DialerController {
  constructor(private apiposService: ApiPosService) {}

  @UserAuth()
  @Get("/eligibility")
  async checkDialerEligibility(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Query("product") product: string
  ) {
    const data = {
      eligible: false,
    };
    const roleId = req?.userInfo?.pos_role_id;
    if (roleId != PosRoles.Agent) {
      return sendResponse(req, res, 200, "ok", data);
    }
    const isEligible = await this.apiposService.isInternalUserMapped({
      dealerId: req.userInfo?.dealer_id,
      product,
    });
    data.eligible = isEligible;
    return sendResponse(req, res, 200, "ok", data);
  }

  @Post("/lead-callback")
  @UserAuth(PosRoles.Agent)
  @ApiOperation({
    summary: "Set dialer callback for given lead",
  })
  async setDialerCallback(
    @Req() req: ReqWithUser,
    @Body() body: DialerSetCallbackRequestDto,
    @Res() res: Response
  ) {
    const dealerId = req.userInfo?.dealer_id;
    await this.apiposService.setDialerCallback({
      dealerId,
      ...body,
    });
    return sendResponse(req, res, 200, "ok", {
      msg: "Callback set successfully",
    });
  }
}

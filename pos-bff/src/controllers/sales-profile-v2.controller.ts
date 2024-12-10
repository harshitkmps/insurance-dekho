import { Controller, Get, HttpStatus, Req, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { PosRoles } from "../constants/pos-roles.constants";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { sendResponse } from "../services/helpers/response-handler";
import { Response } from "express";
import SalesService from "../services/sales-service";

@Controller("/v2/sales")
@ApiTags("Sales Profile V2")
export class SalesProfileV2Controller {
  constructor(private salesService: SalesService) {}

  @Get("/users")
  @UserAuth(PosRoles.SuperAdmin, PosRoles.Admin)
  @ApiOperation({
    summary: "Get sales users",
  })
  async getSalesUsers(@Req() req: ReqWithUser, @Res() res: Response) {
    const queryParams = this.salesService.prepareFetchSfaUsersParams(req.query);
    const sfaUsers = await this.salesService.getSfaUsers(queryParams);
    const transformedResponse = this.salesService.transformSfaUserResponse(
      req.query.step as string,
      sfaUsers.data
    );
    return sendResponse(req, res, 200, "ok", transformedResponse);
  }

  @Get("/designations")
  @ApiOperation({
    summary: "Get sales users",
  })
  async getDesignations(@Req() req: ReqWithUser, @Res() res: Response) {
    const designations = await this.salesService.fetchDesignations();
    return sendResponse(
      req,
      res,
      HttpStatus.OK,
      "fetched designations",
      designations
    );
  }

  @Get("/teams")
  @ApiOperation({
    summary: "Get sales users",
  })
  async getTeams(@Req() req: ReqWithUser, @Res() res: Response) {
    const designations = await this.salesService.fetchTeams();
    return sendResponse(
      req,
      res,
      HttpStatus.OK,
      "fetched designations",
      designations
    );
  }
}

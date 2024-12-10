import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CrossSellService } from "../services/cross-sell.service";
import { sendResponse } from "../services/helpers/response-handler";
import CommonUtils from "../utils/common-utils";
import { Request, Response } from "express";
import { GetDealersListDto } from "../dtos/cross-sell/get-dealers.dto";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { PosRoles, SalesRoles } from "../constants/pos-roles.constants";

@Controller("/v1/cross-sell")
@ApiTags("Cross Sell")
export class CrossSellController {
  constructor(private readonly crossSellService: CrossSellService) {}

  @Post("/health-lead")
  @ApiOperation({
    summary: "Add cross-sell health lead",
  })
  @UserAuth(...SalesRoles, PosRoles.Agent)
  async addHealthLead(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Body() body: any
  ) {
    try {
      let dealerId = req.body?.dealer_id;
      if (req.userInfo.pos_role_id == PosRoles.Agent) {
        dealerId = req.userInfo.dealer_id;
      }
      const creatorIamId = req.userInfo.uuid;
      const params = { ...body, creatorIamId, dealerId };
      const data = await this.crossSellService.createHealthLead(params);
      sendResponse(req, res, 200, "Health lead created successfully", {
        ...data,
      });
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in adding cross sell health lead", {
        error,
      });
      return sendResponse(
        req,
        res,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "error",
        error?.response || "Something went wrong"
      );
    }
  }

  @Get("/customers")
  @UserAuth(PosRoles.Agent, ...SalesRoles)
  @ApiOperation({ summary: "get customers list for a dealer" })
  async getCustomers(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Query() query: any
  ) {
    try {
      let dealerId = req.userInfo?.dealer_id;
      if (SalesRoles.includes(req.userInfo.pos_role_id)) {
        dealerId = query?.dealerId;
      }
      const response = await this.crossSellService.getCustomers(dealerId);
      return sendResponse(req, res, 200, "ok", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in adding cross sell health lead", {
        error,
      });
      return sendResponse(
        req,
        res,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "error",
        error?.response || "Something went wrong"
      );
    }
  }

  @Get("/dealers")
  @UserAuth(...SalesRoles)
  @ApiOperation({ summary: "get dealers list for a single RM" })
  async getDealers(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Query() query: GetDealersListDto
  ) {
    try {
      const response = await this.crossSellService.getDealers(
        query,
        req.userInfo?.uuid
      );
      return sendResponse(req, res, 200, "ok", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in adding cross sell health lead", {
        error,
      });
      return sendResponse(
        req,
        res,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "error",
        error?.response || "Something went wrong"
      );
    }
  }
}

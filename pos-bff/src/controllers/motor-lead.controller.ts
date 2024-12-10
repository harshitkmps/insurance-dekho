import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import { Request, Response } from "express";
import { Logger } from "@nestjs/common";
import { sendResponse } from "../services/helpers/response-handler";
import MotorProposalService from "../services/motor-proposal.service";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import CommonUtils from "../utils/common-utils";
import MotorOfflineService from "../services/motor-offline-service";
import CommonApiHelper from "../services/helpers/common-api-helper";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { LeadMiddlewareService } from "../core/api-helpers/lead-middleware.service";
import { UserAuth } from "../decorators/user-auth.decorator";

@Controller("/v1/motor-lead")
@ApiTags("Motor Lead")
export class MotorLeadController {
  private authMiddleware: AuthMiddleware;

  constructor(
    private motorProposalService: MotorProposalService,
    private motorOfflineService: MotorOfflineService,
    private apiHelper: CommonApiHelper,
    private leadMiddlewareService: LeadMiddlewareService
  ) {
    this.authMiddleware = new AuthMiddleware(this.apiHelper);
  }

  @Get("/submit")
  @ApiOperation({
    summary: "Submit Motor Proposal to LMW from POS",
  })
  async submitMotorLeadProposalPos(
    @Req() req: ReqWithUser,
    @Res() res: Response
  ) {
    try {
      await this.authMiddleware.use(req, res);
      const queryParams =
        await this.motorProposalService.prepareProposalSubmitParams(
          req.query,
          req.userInfo
        );
      const motorProposalRes =
        await this.leadMiddlewareService.submitMotorProposalPos(queryParams);

      return sendResponse(req, res, 200, "ok", motorProposalRes);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in motor submit lead proposal controller POS", {
        error,
        leadId: req.query.leadId,
        uuid: req.userInfo?.uuid,
        dealerId: req.query?.dealerId,
      });
      return res
        .status(err.response?.status || err.status || 500)
        .json(err?.response);
    }
  }

  @Get("/proposal")
  @ApiOperation({
    summary: "Get Motor Proposal Details from LMW",
  })
  async getMotorProposalDetails(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      await this.authMiddleware.use(req, res);
      const proposalDetails =
        await this.motorProposalService.getMotorProposalInfo(
          req.query,
          req.userInfo
        );
      return sendResponse(req, res, 200, "ok", proposalDetails);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in get motor proposal details", {
        error,
        leadId: req.query.leadId,
      });
      return res
        .status(err?.response?.status || err?.status || 500)
        .json({ message: err.response?.message || err.message });
    }
  }

  @Post("/proposal")
  @ApiOperation({
    summary: "Submit Motor Proposal to LMW from ID Edge",
  })
  async updateProposalDetailsToLMW(@Req() req: any, @Res() res: any) {
    try {
      Logger.debug("motor update proposal api", {
        body: req.body,
      });
      const motorProposalRes =
        await this.motorProposalService.updateMotorProposalDetails(req.body);
      return sendResponse(req, res, 200, "ok", motorProposalRes);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in updation of proposal details to LMW", {
        error,
        leadId: req.body.leadId,
      });
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }

  @Post("/")
  @ApiOperation({
    summary: "Create Lead details to LMW",
  })
  async createLead(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any
  ) {
    try {
      Logger.debug("creating lead details params", { body });
      const data = await this.motorProposalService.createLead(body);
      return sendResponse(req, res, 200, "ok", data);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in create lead motor", {
        error,
        leadId: req.query.leadId,
      });
      return res
        .status(err?.response?.status || err?.status || 500)
        .json(err.response || err.message);
    }
  }

  @Post("/rto-details")
  @ApiOperation({
    summary: "Get vehicle details from LMW",
  })
  @UserAuth()
  async getVehicleDetails(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const data = await this.motorOfflineService.fetchRtoDataFromLmw(
        req.body,
        req.userInfo.uuid
      );
      return sendResponse(req, res, 200, "Success", data);
    } catch (err) {
      Logger.error("error in get vehicle details", {
        err,
      });
      return sendResponse(
        req,
        res,
        err?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "error",
        err.response?.errors || err.message
      );
    }
  }
}

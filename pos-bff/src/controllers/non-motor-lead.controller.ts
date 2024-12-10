import { Controller, Get, Post, Req, Res } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import PointsManagementService from "../services/points-management-service";
import { sendResponse } from "../services/helpers/response-handler";
import DealerService from "../services/dealer-service";
import HealthLeadService from "../services/health-lead.service";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { ChannelPartnerTypes } from "../constants/channel-partners.constants";
import NonMotorLeadService from "../services/non-motor-lead.service";
import CommonUtils from "../utils/common-utils";
import { Request, Response } from "express";
import CommonApiHelper from "../services/helpers/common-api-helper";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";

@Controller("/v1/non-motor-lead")
@ApiTags("Non Motor Lead")
export class NonMotorLeadController {
  private authMiddleware: AuthMiddleware;

  constructor(
    private pointsManagementService: PointsManagementService,
    private dealerService: DealerService,
    private healthLeadService: HealthLeadService,
    private nonMotorLeadService: NonMotorLeadService,
    private apiHelper: CommonApiHelper
  ) {
    this.authMiddleware = new AuthMiddleware(this.apiHelper);
  }

  @Get("/proposal")
  @ApiOperation({
    summary: "Get Health Proposal Details from LMW",
  })
  async getHealthProposalDetails(
    @Req() req: ReqWithUser,
    @Res() res: Response
  ) {
    try {
      const isUserAuthenticated = await this.authMiddleware.use(req, res);
      Logger.debug("is user logged in ->", { isUserAuthenticated });

      const proposalDetails =
        await this.healthLeadService.getHealthProposalInfo(
          req.query,
          isUserAuthenticated ? true : false
        );

      if (!isUserAuthenticated) {
        return sendResponse(req, res, 200, "ok", proposalDetails);
      }

      const reqBody = {
        ...req.body,
        dealerId: Number(proposalDetails?.lead?.dealer_id),
      };

      const { showScoreCard } =
        await this.pointsManagementService.checkScoreCardVisible(
          reqBody,
          isUserAuthenticated,
          req.userInfo
        );
      if (!showScoreCard) {
        delete proposalDetails.lead.commissionData;
        delete proposalDetails.lead.rewardError;
      }
      return sendResponse(req, res, 200, "ok", proposalDetails);
    } catch (err) {
      Logger.error("error in get health proposal details", { err });
      return res
        .status(err?.response?.status || err?.status || 500)
        .json({ message: err.response?.message || err.message });
    }
  }

  @Post("/proposal")
  @ApiOperation({
    summary: "Submit Health Proposal to LMW",
  })
  async submitLeadProposalApp(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      Logger.debug("non-motor proposal submit API agent app", {
        query: req.query,
      });
      const isUserAuthenticated = await this.authMiddleware.use(req, res);
      Logger.debug("is user logged in ->", { isUserAuthenticated });
      const reqBody = {
        ...req.body,
        dealerId: req.userInfo?.dealer_id,
      };

      const dealerParams = {
        dealer_id: isUserAuthenticated ? reqBody.dealerId : "",
      };
      const dealerDetails = await this.dealerService.getDealerDetails(
        dealerParams
      );
      const channelType =
        ChannelPartnerTypes[dealerDetails?.[0]?.channel_partner_type];
      const channelSubType =
        channelType !== ChannelPartnerTypes.PARTNER
          ? dealerDetails?.[0]?.channel_partner_sub_type
          : undefined;
      const channelCity = dealerDetails?.[0]?.city_id;
      const channelName = dealerDetails?.[0]?.name;

      const healthProposalResult =
        await this.healthLeadService.submitHealthProposalApp(
          req.body,
          channelName,
          req.userInfo?.gcd_code,
          channelCity,
          channelType,
          channelSubType
        );
      return sendResponse(req, res, 200, "ok", healthProposalResult);
    } catch (err) {
      Logger.error(
        "error in non-motor submit lead proposal controller ID Edge",
        {
          err,
        }
      );
      return res.status(err?.status || 500).json(err.response);
    }
  }

  @Post("/")
  @ApiOperation({
    summary: "Add non motor lead through POS",
  })
  async addNonMotorLead(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug("adding non motor lead through POS", { body: req.body });
      const body = { ...req.body };
      const response = await this.nonMotorLeadService.addNonMotorLead(body);
      return sendResponse(req, res, 200, "ok", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in adding health lead from idedge", {
        error,
      });
      return res
        .status(err?.response?.status || err?.status || 500)
        .json({ message: err.response?.message || err.message });
    }
  }

  @Post("/selected-quote")
  @ApiOperation({
    summary: "Save Non Motor Selected Quotes",
  })
  async saveSelectedQuote(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug("Save Non Motore Selected Quote Request", {
        body: req.body,
      });
      const body = { ...req.body };
      const response = await this.nonMotorLeadService.saveSelectedQuote(body);
      return res.status(200).json(response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in saving non motor selected quote details", {
        error,
      });
      return res
        .status(err?.response?.status || err?.status || 500)
        .json({ message: err.response?.message || err.message });
    }
  }

  @Post("/proposal-details")
  @ApiOperation({
    summary: "Save non motor proposal Data",
  })
  async saveProposalDetails(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug("Save Non Motor Proposal Request", { body: req.body });
      const body = { ...req.body };
      const response = await this.nonMotorLeadService.saveProposalDetails(body);
      return sendResponse(req, res, 200, "ok", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in saving non motor proposal details", {
        error,
      });
      return res
        .status(err?.response?.status || err?.status || 500)
        .json({ message: err.response?.message || err.message });
    }
  }

  @Post("/submit-proposal-details")
  @ApiOperation({
    summary: "Submit non motor proposal Data",
  })
  async submitProposalDetails(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug("Submit Non Motor Proposal Request", { body: req.body });
      const body = { ...req.body };
      const response = await this.nonMotorLeadService.submitProposalDetails(
        body
      );
      return res.status(200).json(response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in submitting non motor proposal details", {
        error,
      });
      return res
        .status(err?.response?.status || err?.status || 500)
        .json({ message: err.response?.message || err.message });
    }
  }
}

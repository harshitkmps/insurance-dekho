import ApiPosService from "../services/apipos-service";
import FusionService from "../services/fusion-service";
import HealthLeadService from "../services/health-lead.service";
import { sendResponse } from "../services/helpers/response-handler";
import {
  Controller,
  Req,
  Res,
  Get,
  Post,
  Logger,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";
import moment from "moment";
import ContextHelper from "../services/helpers/context-helper";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";

@Controller("/v1")
@ApiTags("Fusion")
export class FusionController {
  constructor(
    private apiPosService: ApiPosService,
    private healthLeadService: HealthLeadService,
    private fusionService: FusionService
  ) {}

  @Get("/checkCallingAbility")
  @UserAuth()
  @ApiOperation({
    summary: "request to pos-api from ID Edge",
  })
  async checkCallingAbility(@Req() req: ReqWithUser, @Res() res: any) {
    try {
      Logger.debug("checkCallingAbility API ID Edge", {
        userInfo: req.userInfo,
      });
      const params = {
        gcdCode: req.userInfo.gcd_code,
      };
      const config = {
        headers: {
          Authorization: req.header("Authorization"),
        },
      };
      const result = await this.apiPosService.checkCallingAbility(
        params,
        config
      );
      return sendResponse(req, res, 200, "ok", { data: result });
    } catch (err) {
      Logger.error(err);
    }
  }

  @Get("/fusion/schedule")
  @UserAuth()
  @ApiOperation({
    summary: "Get Meetings Count For User",
  })
  async getMeetingCount(@Req() req: ReqWithUser, @Res() res: Response) {
    const userInfo = req.userInfo;
    const { offset, limit } = req.query;
    Logger.debug("get fusion meetings controller request query", {
      offset,
      limit,
      gcd_code: req.userInfo.gcd_code,
    });
    const meetingsScheduleParams = {
      agent_id: userInfo.user_id,
      meeting_start_date: moment().startOf("day").format("YYYY-MM-DD"),
      meeting_end_date: moment().endOf("day").format("YYYY-MM-DD"),
      offset: offset ?? 0,
      limit: limit ?? 10,
      gcd_code: userInfo.gcd_code,
    };

    const callingAbilityParams = {
      gcdCode: req.userInfo.gcd_code,
    };

    const config = {
      headers: {
        Authorization: req.header("Authorization"),
      },
    };

    const [schedule, callingAbility] = await Promise.all([
      this.healthLeadService.getFusionMeetingSchedule(meetingsScheduleParams),
      this.apiPosService.checkCallingAbility(callingAbilityParams, config),
    ]);

    const fusionLeadPopup = await this.fusionService.checkLeadInDuration(
      schedule?.leads
    );

    return sendResponse(req, res, 200, "ok", {
      count: schedule?.count ?? null,
      ...callingAbility,
      inDurationLead: fusionLeadPopup,
    });
  }

  @Get("/fusion/meeting/schedule")
  @UserAuth()
  @ApiOperation({
    summary: "Get Fusion Meetings scheduled data from LMW for given agent",
  })
  async getFusionMeetingDataFromLMW(
    @Req() req: ReqWithUser,
    @Res() res: Response
  ) {
    try {
      const userInfo = req.userInfo;
      const { offset, limit, fromHomePage, meetingStartDate, meetingEndDate } =
        req.query;
      Logger.debug("get fusion meetings data controller request query", {
        offset,
        limit,
        meetingStartDate,
        meetingEndDate,
        gcd_code: req.userInfo?.gcd_code,
      });
      const result = await this.fusionService.getFusionMeetingDataFromLMW(
        userInfo,
        req.query,
        fromHomePage
      );
      return sendResponse(req, res, 200, "ok", result);
    } catch (err) {
      Logger.error("error in fetching the Fusion Meetings scheduled data", {
        err,
      });
      return sendResponse(
        req,
        res,
        400,
        "error in fetching the Fusion Meetings data",
        err?.response ?? err
      );
    }
  }

  @Post("/fusion/update-meeting-status")
  @UserAuth()
  @ApiOperation({
    summary:
      "Update Fusion Meeting Status to Health Lead and return the lead data",
  })
  async updateMeetingStatus(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug("update meeting status controller", { body: req.body });
      const body = req.body;
      if (!body.lead_id) {
        return sendResponse(req, res, 400, "Lead ID does not exist", {});
      }
      // const { fromHomePage } = body;
      const result = await this.fusionService.updateMeetingStatus(body);
      return sendResponse(req, res, 200, "ok", result);
    } catch (err) {
      Logger.error("error Update Meeting Status to Health Lead", { err });
      return sendResponse(
        req,
        res,
        err?.response?.status || err.status || 400,
        "error in update meeting status",
        err?.response || err
      );
    }
  }

  @Get("/getPartnerDetails")
  @UserAuth()
  @ApiOperation({
    summary: "request to pos-api from ID Edge",
  })
  async getPartnerDetails(@Req() req: any, @Res() res: any) {
    try {
      Logger.debug("get PartnerDetails API ID Edge", {
        userInfo: req.userInfo,
      });
      const params = {
        user_id: req.userInfo.user_id,
        gcdCode: req.userInfo.gcd_code,
      };
      const config = {
        headers: {
          Authorization: req.header("Authorization"),
        },
      };
      const result = await this.apiPosService.getPartnerDetails(params, config);
      if (req.userInfo.first_name)
        result["firstName"] = req.userInfo.first_name;
      return sendResponse(req, res, 200, "ok", { data: result });
    } catch (err) {
      Logger.error(err);
      return sendResponse(req, res, 500, "error", { error: err.response });
    }
  }

  @Get("/agent-available-time-slots")
  @UserAuth()
  @ApiOperation({
    summary:
      "request to api fusion from ID Edge to get all availabel slots of agent",
  })
  async getAgentAvailableTimeSlots(@Req() req: any, @Res() res: any) {
    try {
      Logger.debug("get agent available Time slots", {
        visit_id: req.query.lead_id,
      });
      const result = await this.fusionService.getAgentAvailableTimeSlots(
        req.query.lead_id
      );
      return sendResponse(req, res, 200, "ok", { data: result });
    } catch (err) {
      Logger.error(err);
    }
  }

  @Get("/fusion/leadDetails")
  @UserAuth()
  @ApiOperation({
    summary: "fetch leadDetails data using visit id",
  })
  async fetchMeetingDataByVisitId(@Req() req: any, @Res() res: any) {
    try {
      if (req.query.visit_id) {
        Logger.debug("fetch leadDetails data using visit id controller", {
          visit_id: req.query.visit_id,
        });
        const result = await this.fusionService.fetchMeetingDataByVisitId(
          req.query.visit_id
        );
        return sendResponse(req, res, 200, "ok", result);
      }
    } catch (err) {
      Logger.error("error in fetch leadDetails data using visit id", { err });
      return sendResponse(req, res, 400, "error in fetch leadDetails data", {});
    }
  }

  @Post("/fusion/send-otp-customer")
  @UserAuth()
  @ApiOperation({
    summary: "send otp to the customer for fusion",
  })
  async sendOtpToCustomer(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug("send otp to the customer controller", {
        body: req.body,
      });
      const params = {
        source: req.body.source,
        sub_source: req.body.sub_source,
        medium: req.body.medium,
        visit_id: req.body.visit_id,
      };
      const response = await this.fusionService.sendOtpToCustomer(params);
      return sendResponse(req, res, 200, "ok", response);
    } catch (error) {
      const errObj =
        error?.response?.message?.errors[0]?.detail ??
        error?.message?.errors[0]?.detail;
      Logger.error(`Error in sending otp`, error);
      return sendResponse(
        req,
        res,
        error?.response?.status ?? error?.status ?? 400,
        errObj?.message ?? `Error in the sending otp`,
        error?.response || error
      );
    }
  }

  @Get("/fusion/agent/config")
  @UserAuth()
  @ApiOperation({
    summary: "get partner config",
  })
  async getPartnerConfig(@Req() req: ReqWithUser, @Res() res: Response) {
    Logger.debug("get partner config request query", {
      userInfo: req.userInfo,
    });

    const partnerConfigParams = {
      gcdCode: req.userInfo.gcd_code,
    };

    const config = {
      headers: {
        Authorization: req.header("Authorization"),
      },
    };

    const partnerConfig = await this.apiPosService.fetchPartnerConfig(
      partnerConfigParams,
      config
    );
    return sendResponse(req, res, 200, "ok", {
      partnerConfig,
    });
  }

  @Get("/share-plans")
  @UserAuth()
  @ApiOperation({
    summary: "get shared plan for lead from LMW",
  })
  async getSharePlansByVisitId(@Req() req: Request, @Res() res: Response) {
    try {
      const params = req.query;
      const visitId: any = params?.visit_id;
      if (!visitId) {
        throw new HttpException("missing parameters : visitId required", 401);
      }
      Logger.debug("get shared plan from Lmw", visitId);
      const response = await this.fusionService.fetchSharedPlans(params);
      return sendResponse(req, res, 200, "ok", response);
    } catch (error) {
      Logger.error(`Error in fetching shared plan`, error);
      return sendResponse(
        req,
        res,
        error?.response?.status ?? error?.status ?? 500,
        error?.response?.error?.message ??
          error?.response?.message ??
          error?.error?.message ??
          error.message ??
          `Error in fetching shared plan`,
        error?.response ?? error
      );
    }
  }

  @Get("/fusion/lob-list")
  @UserAuth()
  @ApiOperation({
    summary: "Get fusion meeting page lobs from TBL Config",
  })
  async getAllLOBsForFusionAgent(@Req() req: any, @Res() res: any) {
    try {
      const userInfo = req.userInfo;
      const context = ContextHelper.getStore();
      const requestOrigin = context.get("medium");
      Logger.debug("fusion LOB config get API request");
      const config = await this.fusionService.getAllLOBsForFusionAgent(
        userInfo,
        requestOrigin
      );

      return sendResponse(req, res, 200, "ok", config);
    } catch (err) {
      Logger.error("error in fusion config API", {
        err,
      });
      return sendResponse(
        req,
        res,
        err?.response?.status || err.status || 500,
        "error",
        err?.response || err
      );
    }
  }
}

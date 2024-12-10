import { ApiOperation, ApiTags } from "@nestjs/swagger";
import HealthLeadService from "../services/health-lead.service";
import CommonApiHelper from "../services/helpers/common-api-helper";
import { sendResponse } from "../services/helpers/response-handler";
import LeadAddService from "../services/lead-add-service";
import CommonUtils from "../utils/common-utils";
import {
  Controller,
  Post,
  Req,
  Res,
  Logger,
  HttpStatus,
  Get,
  Body,
} from "@nestjs/common";
import { Request, Response } from "express";
import { UserAuth } from "../decorators/user-auth.decorator";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { HealthLeadMiddlewareService } from "../services/health-lmw.service";

@Controller("/v1/health-lead")
@ApiTags("Health Lead")
export class HealthLeadController {
  private authMiddleware: AuthMiddleware;
  constructor(
    private apiHelper: CommonApiHelper,
    private healthLeadService: HealthLeadService,
    private leadAddService: LeadAddService,
    private healthLmwService: HealthLeadMiddlewareService
  ) {
    this.authMiddleware = new AuthMiddleware(this.apiHelper);
  }

  @Get()
  @ApiOperation({
    summary: "Get Health Lead Details",
  })
  async getLeadInfo(@Req() req: ReqWithUser, @Res() res: Response) {
    const query: any = req.query;
    const leadDetails = await this.healthLeadService.getLeadDetails(query);
    // const updatedLeadDetails = this.healthProposalService.maskLeadDetails(
    //   leadDetails,
    //   query.stage
    // );
    return sendResponse(req, res, 200, "ok", leadDetails);
  }

  @Post("/connect-call")
  @UserAuth()
  @ApiOperation({
    summary: "request to connect call LMW from ID Edge",
  })
  async connectCallCustomer(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      Logger.debug("connect-call API ID Edge", {
        body: req.body,
      });
      const options = {
        endpoint:
          process.env.API_LMW_HEALTH_URL +
          `/health/leads/connect-call-customer`,
        timeout: 5000,
      };
      const reqBody = {
        ...req.body,
        caller_identifier: req.userInfo.gcd_code,
      };
      const response = await this.apiHelper.postData(options, reqBody);

      return sendResponse(req, res, 200, "ok", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      return sendResponse(
        req,
        res,
        err.status || 500,
        "error",
        error?.response || err
      );
    }
  }

  @Post("/update-meeting-status")
  @UserAuth()
  @ApiOperation({
    summary: "Update Meeting Status to Health Lead",
  })
  async updateMeetingStatus(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      Logger.debug("update meeting status controller", { body: req.body });
      const body = { ...req.body };
      const response = await this.healthLeadService.updateMeetingStatus(body);
      return sendResponse(req, res, 200, "ok", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in ifm get redirection url", {
        error,
        leadId: req.query.leadId,
        uuid: req.userInfo?.uuid,
        dealerId: req.query?.dealerId,
      });
      return res.status(err.status || 500).json(err.response);
    }
  }

  @Post("/add-health-lead")
  @UserAuth()
  @ApiOperation({
    summary: "Add health lead through agent app",
  })
  async addHealthLeadAgentApp(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug("adding health lead through agent app", { body: req.body });
      const body = { ...req.body };
      const response = await this.leadAddService.addOrUpdateHealthLead(body);
      return sendResponse(req, res, 200, "ok", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in adding health lead from idedge", {
        error,
      });
      return res.status(err.status || 500).json(err.response);
    }
  }

  @Post("/agent-followup-free-slots")
  @ApiOperation({
    summary: "get agent folloup free slots",
  })
  async getFollowUpAvailableSlots(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug("get agent folloup free slots controller", {
        body: req.body,
      });
      const body = { ...req.body };
      const response = await this.healthLeadService.getFollowUpAvailableSlots(
        body
      );
      return sendResponse(req, res, 200, "ok", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in get agent folloup free slots api", {
        error,
      });
      return res.status(err.status || 500).json(err.response);
    }
  }

  @Post("/")
  @ApiOperation({
    summary: "Add health lead through POS",
  })
  async addHealthLead(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any
  ) {
    try {
      Logger.debug("adding health lead through POS", { body });
      const response = await this.healthLmwService.addHealthLead(body);
      return sendResponse(req, res, 200, "ok", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in adding health lead from idedge", {
        error,
      });
      return res.status(err.status || 500).json(err.response);
    }
  }

  @Post("/update-visit")
  @ApiOperation({
    summary: "Update health lead",
  })
  async updateHealthVisit(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug("update health lead", { body: req.body });
      const body = { ...req.body };
      const response = await this.leadAddService.updateHealthVisit(body);
      return sendResponse(req, res, 200, "ok", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in updating health lead from idedge", {
        error,
      });
      return res.status(err.status || 500).json(err.response);
    }
  }

  @Post("/proposal-details")
  @ApiOperation({
    summary: "Save proposal Data",
  })
  async saveProposalDetails(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug("Save Proposal Request", { body: req.body });
      const body = { ...req.body };
      const response = await this.leadAddService.saveProposalDetails(body);
      return sendResponse(req, res, 200, "ok", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in saving proposal details", {
        error,
      });
      return res.status(err.status || 500).json(err.response);
    }
  }

  @Post("/medical-details")
  @ApiOperation({
    summary: "Save Medical Data",
  })
  async saveMedicalDetails(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug("Save Medical Request", { body: req.body });
      const body = { ...req.body };
      const response = await this.leadAddService.saveMedicalDetails(body);
      return sendResponse(req, res, 200, "ok", response);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in saving medical details", {
        error,
      });
      return res.status(err.status || 500).json(err.response);
    }
  }

  @Post("/nominee-details")
  @ApiOperation({
    summary: "Save Nominee Data",
  })
  async saveNomineeDetails(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any
  ) {
    try {
      Logger.debug("Save Nominee Request", { body });
      const response = await this.healthLeadService.saveNomineeDetails(body);
      return sendResponse(req, res, 200, "ok", response.result);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in saving nominee details", {
        error,
      });
      return res.status(err.status || 500).json(err.response);
    }
  }

  @Post("/communication-details")
  @ApiOperation({
    summary: "Save Communication Data",
  })
  async saveCommunicationDetails(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any
  ) {
    try {
      Logger.debug("Save Communication Request", { body });
      const response = await this.healthLeadService.saveCommunicationDetails(
        body
      );
      return sendResponse(req, res, 200, "ok", response.result);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in saving communication details", {
        error,
      });
      return res.status(err.status || 500).json(err.response);
    }
  }

  @Post("/selected-quote")
  @ApiOperation({
    summary: "Save Health Selected Quotes",
  })
  async saveSelectedQuote(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug("Save Selected Quote Request", { body: req.body });
      const body = { ...req.body };
      const response = await this.leadAddService.saveSelectedQuote(body);
      return res.status(200).json(response); // To be changed
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in saving selected quote details", {
        error,
      });
      return res.status(err.status || 500).json(err.response);
    }
  }

  @Post("/policy") // should be get, but conflicts with B2C code :(
  @ApiOperation({
    summary: "Get policy doc details",
  })
  async getLeadDetails(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const body = req.body;
      await this.authMiddleware.use(req, res);
      const policyDetails = await this.healthLeadService.getPolicyDoc(body);

      const updatedPolicyDetails =
        await this.healthLeadService.checkPolicyDocAccess(
          policyDetails,
          req.userInfo?.pos_role_id
        );

      return sendResponse(req, res, 200, "ok", updatedPolicyDetails);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in fetching health lead details", {
        error,
      });
      return sendResponse(
        req,
        res,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "error",
        err.response
      );
    }
  }

  @Post("/payment-details") // should be get, but conflicts with B2C code :(
  @ApiOperation({
    summary: "Get Health Payment Details",
  })
  async getPaymentDetails(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const body = req.body;
      await this.authMiddleware.use(req, res);
      const paymentDetails = await this.healthLeadService.getPaymentDetails(
        body
      );
      const updatedPaymentDetails =
        this.healthLeadService.checkPaymentDetailsAccess(
          paymentDetails,
          req.userInfo
        );
      return sendResponse(req, res, 200, "ok", updatedPaymentDetails);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in fetching health payment details", {
        error,
      });
      return sendResponse(
        req,
        res,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "error",
        err.response
      );
    }
  }

  @Post("/medical") // should be get, but because of B2C, it is POST :(
  @ApiOperation({
    summary: "Get Health Medical details",
  })
  async getMedicalDetails(@Req() req: ReqWithUser, @Res() res: Response) {
    const body: any = req.body;
    const medicalInfo = await this.healthLeadService.getMedicalDetails(body);
    // const updatedMedicalInfo = this.healthProposalService.maskMedicalDetails(
    //   medicalInfo,
    //   body.stage
    // );
    return sendResponse(req, res, 200, "ok", medicalInfo);
  }
}

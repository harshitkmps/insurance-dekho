import AgentProfilingService from "../services/agent-profiling-service";
import { sendResponse } from "../services/helpers/response-handler";
import { Request, Response } from "express";
import { Req, Res, Get, Controller, Post, Logger } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { PosRoles } from "../constants/pos-roles.constants";
import { Roles } from "../constants/roles.constants";

@Controller("/v1/agent-profile")
@ApiTags("Agent Profiling")
export class AgentProfilingController {
  constructor(private agentProfilingService: AgentProfilingService) {}

  @Get("/get-field-validation-config")
  @UserAuth()
  async getFieldValidationConfig(
    @Req() request: Request,
    @Res() response: Response
  ) {
    // get questions config from brokerage master
    Logger.debug("Inside get field validation config", request.params);
    const res = await this.agentProfilingService.fetchFieldValidationConfig(
      request.params
    );
    Logger.debug("Sending following response for profile id", res);
    return sendResponse(request, response, 200, "ok", res);
  }

  @Get("/get-dealer-properties/:cps_id")
  @UserAuth(...Roles.POS_ADMIN_ALL, ...Roles.POS_SALES_ALL, Roles.POS_AGENT)
  async getDealerProperties(
    @Req() request: Request,
    @Res() response: Response
  ) {
    const res = await this.agentProfilingService.fetchDealerProperties(
      request.params
    );
    res.data = await this.agentProfilingService.formatDealerProperties(
      res.data
    );
    // Logger.debug("Sending following response for dealer properties", res);
    return sendResponse(request, response, 200, "ok", res);
  }

  @Post("/update-dealer-properties/:cps_id")
  @UserAuth(...Roles.POS_ADMIN_ALL, ...Roles.POS_SALES_ALL, Roles.POS_AGENT)
  async updateDealerProperties(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    Logger.debug("Inside update dealer properties", request.params);
    const { pos_role_id, cps_id } = request.userInfo;
    if (pos_role_id === PosRoles.Agent) {
      request.params.cps_id = cps_id;
    }
    const res = await this.agentProfilingService.updateDealerProperties(
      request.body,
      request.params,
      request.userInfo
    );
    // Logger.debug("Sending following response for update dealer properties", res);
    return sendResponse(request, response, 200, "ok", res);
  }

  @Get("/fetch-basic-details-skeleton")
  @UserAuth()
  async fetchBasicDetailsSkeleton(
    @Req() request: Request,
    @Res() response: Response
  ) {
    Logger.debug("Inside fetchBasicDetailsSkeleton controller", request.params);
    const res = await this.agentProfilingService.fetchBasicDetailsSkeleton();
    // Logger.debug("Sending basic details skeleton", res);
    return sendResponse(request, response, 200, "ok", res);
  }

  @Get("/config")
  @UserAuth(...Roles.POS_ADMIN_ALL, ...Roles.POS_SALES_ALL, Roles.POS_AGENT)
  async agentProfilingPageConfig(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const res = this.agentProfilingService.prepareConfig(request.userInfo);
    return sendResponse(request, response, 200, "ok", res);
  }
}

import { Controller, Req, Res, Put } from "@nestjs/common";
import LsqService from "../services/lsq-service";
import { sendResponse } from "../services/helpers/response-handler";
import { Logger } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller("/v1/crm")
@ApiTags("Lsq")
export class LsqController {
  constructor(private lsqService: LsqService) {}

  @Put("/assign-user")
  @ApiOperation({
    summary: "RM assignment for the Lead given by LSQ",
  })
  async assignUser(@Req() request: any, @Res() response: any) {
    const body = request.body;
    const mx_uuid = body.mx_UUID;
    const mx_assign_lead_rm_uuid = body.mx_Assigned_LEAD_RM_UUID;
    Logger.debug("assigning leads ", body);
    if (mx_uuid === "" || mx_assign_lead_rm_uuid === "") {
      return sendResponse(
        request,
        response,
        401,
        "error",
        "Both fields are required"
      );
    }
    const data = await this.lsqService.assignUser(request, response);
    if (data) {
      return sendResponse(
        request,
        response,
        200,
        "sales user assigned successfully",
        []
      );
    } else {
      return sendResponse(
        request,
        response,
        400,
        "requested lead uuid not found in system",
        []
      );
    }
  }

  @Put("/handover-user")
  @ApiOperation({
    summary:
      "RM details updation before 60 days of becoming an agent given by CPS",
  })
  async handOverUser(@Req() request: any, @Res() response: any) {
    const body = request.body;
    const mx_uuid = body.mx_UUID;
    Logger.debug("user handover ", body);
    if (mx_uuid === "") {
      Logger.error(`error in user handover mx uuid is empty`);
      return sendResponse(request, response, 401, "error", "uuid is required");
    }
    const data = await this.lsqService.handOverUser(request, response);
    return sendResponse(
      request,
      response,
      200,
      "lead handover done successfully",
      data
    );
  }

  @Put("/rm-handover")
  @ApiOperation({
    summary:
      "RM details updation after 60 days of becoming an agent given by CPS",
  })
  async rmHandOver(@Req() request: any, @Res() response: any) {
    const body = request.body;
    const mx_uuid = body.mx_UUID;
    const mx_assign_agent_rm_uuid = body.mx_Assigned_AGENT_RM_UUID;
    Logger.log("rm handover request body ", body);
    if (mx_uuid === "" || mx_assign_agent_rm_uuid === "") {
      Logger.error(
        `error in rm handover mx uuid or mx_assign_agent_rm_uuid is empty`
      );
      return sendResponse(
        request,
        response,
        401,
        "error",
        "Both fields are required"
      );
    }
    const data = await this.lsqService.rmHandOver(request, response);
    if (data && data.meta.code == 200) {
      Logger.log(
        `rm handover response : RM detalis updated successfully for user ${data.data.iam_uuid} `
      );
      return sendResponse(
        request,
        response,
        200,
        "RM detalis updated successfully",
        []
      );
    } else {
      return sendResponse(
        request,
        response,
        400,
        "requested lead uuid not found in system",
        []
      );
    }
  }
}

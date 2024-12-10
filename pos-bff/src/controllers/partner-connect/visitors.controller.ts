import { Controller, Get, Post, Put, Req, Res } from "@nestjs/common";
import { sendResponse } from "../../services/helpers/response-handler";
import PartnerConnectService from "../../services/partner-connect-service";
import { ApiTags } from "@nestjs/swagger";
import { UserAuth } from "@/src/decorators/user-auth.decorator";
import { ReqWithUser } from "@/src/interfaces/request/req-with-user.interface";
import { Response } from "express";

@Controller("/v1/partner-connect")
@ApiTags("Partner Connect Visitor")
export class VisitorsController {
  constructor(private partnerConnectService: PartnerConnectService) {}

  @Post("/visitor")
  @UserAuth()
  async addVisitor(@Req() request: ReqWithUser, @Res() response: Response) {
    const userInfo = request.userInfo;
    if (!request.body.assignedSalesIamUuid) {
      request.body.assignedSalesIamUuid = userInfo.uuid;
    }
    const responseBody = await this.partnerConnectService.addVisitor(
      request.body
    );
    return sendResponse(
      request,
      response,
      200,
      "Visitor added successfully.",
      responseBody.data
    );
  }

  @Get("/visitor/:id")
  @UserAuth()
  async getVisitor(@Req() request: ReqWithUser, @Res() response: Response) {
    const responseBody = await this.partnerConnectService.getVisitor(
      request.params.id
    );
    return sendResponse(
      request,
      response,
      200,
      "Visitor details fetched",
      responseBody
    );
  }

  @Get("/visitor")
  @UserAuth()
  async getMyVisitor(@Req() request: any, @Res() response: any) {
    const userInfo = request.userInfo;
    if (request.query?.salesUserIamId !== request.userInfo?.uuid) {
      request.query.assignedSalesIamUuid = request.query?.salesUserIamId;
      request.query.salesUserIamId = request.userInfo?.uuid;
    } else {
      request.query.assignedSalesIamUuid = userInfo?.uuid;
      request.query.isloginUserFetchData = true;
    }
    const responseBody = await this.partnerConnectService.getVisitorsWithFilter(
      request.query
    );
    const visitors = responseBody.data;
    const data = await this.partnerConnectService.prepareData(visitors.data);
    visitors.data = data;
    return sendResponse(
      request,
      response,
      200,
      "Visitors fetched successfully",
      visitors
    );
  }

  @Put("/visitor/:id")
  @UserAuth()
  async updateVisitor(@Req() request: any, @Res() response: any) {
    const responseBody = await this.partnerConnectService.updateVisitor(
      request.params.id,
      request.body
    );
    return sendResponse(
      request,
      response,
      200,
      "Visitor details updated.",
      responseBody
    );
  }
}

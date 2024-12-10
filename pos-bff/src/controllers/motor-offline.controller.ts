import { Controller, Get, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { Logger } from "@nestjs/common";
import { sendResponse } from "../services/helpers/response-handler";
import MotorOfflineService from "../services/motor-offline-service";
import CommonUtils from "../utils/common-utils";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";

@Controller("/v1/motor-offline")
@ApiTags("Motor Offline")
export class MotorOfflineController {
  constructor(private motorOfflineService: MotorOfflineService) {}

  @Get("/config")
  @UserAuth()
  @ApiOperation({
    summary: "Get configuration for motor-offline pages",
  })
  async getConfig(@Req() req: ReqWithUser, @Res() res: Response) {
    const data = await this.motorOfflineService.getOfflineConfig(req.userInfo);
    return sendResponse(req, res, 200, "offline request created", data);
  }

  @Post("/mmv-autofill")
  @UserAuth()
  @ApiOperation({
    summary: "should autofill mmv for motor offline based on reg no",
  })
  // based on config, we need to call ITMS api and return autodb data for autofilling
  async submitMotorLeadProposalPos(
    @Req() req: ReqWithUser,
    @Res() res: Response
  ) {
    try {
      const {
        autofillRes,
        message = "",
        status = 203,
      } = await this.motorOfflineService.autofillMmvDetails(
        req.body,
        req.userInfo
      );

      return sendResponse(req, res, status, message, autofillRes);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in motor offline auto fill mmv details", {
        error,
        leadId: req.query.leadId,
        uuid: req.userInfo?.uuid,
        dealerId: req.query?.dealerId,
      });
      return res
        .status(err?.response?.status || err?.status || 500)
        .json({ message: err.response?.message || err.message });
    }
  }

  @Post("/upload/link")
  @UserAuth()
  async uploadFileFromLink(@Req() req: any, @Res() res: any) {
    const { file_name } = req.body;
    const response = await this.motorOfflineService.uploadFileFromLink(
      req.body,
      file_name
    );
    return sendResponse(req, res, 200, "upload successful", response);
  }

  @Post("/upload/zigChatlink")
  @UserAuth()
  async uploadDocFromZigChatLink(@Req() req: any, @Res() res: any) {
    const authToken = req?.headers?.authorization;
    const response = await this.motorOfflineService.uploadDocFromZigChatLink(
      req?.body,
      authToken
    );
    return sendResponse(req, res, 200, "upload successful", response);
  }

  @Get("/send/commmunicaton")
  @UserAuth()
  async sendOfflineCommunication(@Req() req: any, @Res() res: any) {
    const query = req.query;
    const response = await this.motorOfflineService.generateCommunication(
      query
    );
    return sendResponse(req, res, 200, "communication generated", response);
  }

  @Post("/")
  @UserAuth()
  @ApiOperation({
    summary: "create offline request in itms",
  })
  async createOfflineRequest(@Req() req: ReqWithUser, @Res() res: Response) {
    const data = await this.motorOfflineService.createOfflineRequest(
      req.body,
      req.userInfo
    );
    return sendResponse(req, res, 200, "offline request created", data);
  }

  @Post("/:id")
  @UserAuth()
  @ApiOperation({
    summary: "update offline request in itms",
  })
  async updateOfflineRequest(@Req() req: any, @Res() res: any) {
    const id = req?.params?.id;
    const data = await this.motorOfflineService.updateOfflineRequest(
      id,
      req?.body
    );
    return sendResponse(req, res, 200, "offline request updated", data);
  }

  @Post("/validate/reg-no")
  @UserAuth()
  @ApiOperation({
    summary:
      "validate if dealer has created ticket with same reg no data in ITMS",
  })
  public async validateRegNo(@Req() req: ReqWithUser, @Res() res: Response) {
    const body = req.body;
    const data = await this.motorOfflineService.validateRegNoTicketExists(
      body,
      req.userInfo
    );
    return sendResponse(req, res, 200, "success", data);
  }

  @Get("/history/:id")
  @UserAuth()
  @ApiOperation({
    summary: "get offline request in itms",
  })
  async getOfflineRequestHistory(@Req() req: any, @Res() res: any) {
    const ticketId = req?.params?.id;
    const inspectionResponse =
      await this.motorOfflineService.getOfflineRequestHistory(ticketId);
    return sendResponse(
      req,
      res,
      200,
      "offline request inspection details",
      inspectionResponse
    );
  }

  @Post("/docs/:id")
  @UserAuth()
  @ApiOperation({
    summary: "Update Doc Ids in ITMS",
  })
  public async updateDocId(@Req() req: Request, @Res() res: Response) {
    const id = req.params.id;
    await this.motorOfflineService.updateProposalDocs(id, req.body);
    return sendResponse(req, res, 200, "docs updated successfully", {});
  }

  @Get("/doc-details")
  @ApiOperation({
    summary: "get offline docs from itms",
    parameters: [
      {
        name: "ticket_mapping_id",
        in: "query",
        example: "9a2d73f3-895d-4b93-8bf2-c1c11165f6eb",
        required: false,
      },
      {
        name: "refId",
        in: "query",
        example: "328609",
        required: false,
      },
      {
        name: "request_type",
        in: "query",
        example: "OFFLINE",
        required: false,
      },
      {
        name: "is_proposal",
        in: "query",
        example: "0",
        required: false,
      },
      {
        name: "medium",
        in: "query",
        example: "POS",
        required: false,
      },
    ],
  })
  async getOfflineDocsRequest(@Req() req: any, @Res() res: any) {
    const docResponse = await this.motorOfflineService.getOfflineDocuments(
      req?.query
    );
    return sendResponse(
      req,
      res,
      200,
      "offline doc details fetched",
      docResponse
    );
  }

  @Get("/:id")
  @UserAuth()
  @ApiOperation({
    summary: "get offline details from itms",
    parameters: [
      {
        name: "id",
        in: "path",
        example: "INS-OFF-Q-330258",
        required: true,
      },
      {
        name: "step",
        in: "query",
        example: "quotes",
        required: false,
      },
      {
        name: "inspectionDetails",
        in: "query",
        example: false,
        required: false,
      },
    ],
  })
  async getOfflineRequest(@Req() req: any, @Res() res: any) {
    const ticketId = req?.params?.id;
    const offlineResponse = await this.motorOfflineService.getOfflineRequest(
      ticketId,
      req?.query
    );
    return sendResponse(
      req,
      res,
      200,
      "offline request details",
      offlineResponse
    );
  }
}

import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  HttpStatus,
  Query,
} from "@nestjs/common";
import { sendResponse } from "../services/helpers/response-handler";
import LifeOfflineService from "../services/life-offline-service";
import { ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { Request, Response } from "express";
import { GetLifeTicketDetailsDto } from "../dtos/life-offline/get-life-ticket-details.dto";
import { GetLifeDocumentsDto } from "../dtos/life-offline/get-documents.dto";

@Controller("/v1/life-offline")
@ApiTags("Life Offline")
export class LifeOfflineController {
  constructor(private lifeOfflineService: LifeOfflineService) {}

  @Post("/")
  @UserAuth()
  async createLifeOfflineRequest(
    @Req() req: ReqWithUser,
    @Res() res: Response
  ) {
    try {
      const userInfo = req.userInfo;
      const body = req.body;
      const data = await this.lifeOfflineService.createLifeOfflineRequest(
        userInfo,
        body
      );
      return sendResponse(req, res, 200, "offline request created", data);
    } catch (error) {
      return sendResponse(
        req,
        res,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "Error creating request",
        error
      );
    }
  }

  @Get("/")
  async getOfflineRequest(
    @Req() req: Request,
    @Res() res: Response,
    @Query() queryParams: GetLifeTicketDetailsDto
  ) {
    try {
      const ticketId = queryParams.ticketUuid;
      const offlineResponse =
        await this.lifeOfflineService.getLifeOfflineRequest(ticketId);
      return sendResponse(
        req,
        res,
        200,
        "offline request details",
        offlineResponse
      );
    } catch (error) {
      return sendResponse(
        req,
        res,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "Error in getting data",
        error
      );
    }
  }

  @Get("/documents-list")
  async getDocumentsList(
    @Req() req: Request,
    @Res() res: Response,
    @Query() queryParams: GetLifeDocumentsDto
  ) {
    try {
      const documentsList = await this.lifeOfflineService.getDocumentsList(
        queryParams
      );
      return sendResponse(req, res, 200, "ok", documentsList);
    } catch (error) {
      return sendResponse(
        req,
        res,
        500,
        "Error fetching documents list",
        error
      );
    }
  }
}

import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Query,
  Body,
  HttpStatus,
} from "@nestjs/common";
import { sendResponse } from "../services/helpers/response-handler";
import ItmsService from "../core/api-helpers/itms-service";
import { ApiTags } from "@nestjs/swagger";
import { ConfigResponse } from "../interfaces/life-offline/create-request-interface";
import { Request, Response } from "express";
import { GetVideoConfigDto } from "../dtos/life-offline/vide-config.dto";
import { VideoSubmitDto } from "../dtos/life-offline/video-submit.dto";
import { VideoVerificationLinkDto } from "../dtos/life-offline/video-link.dto";

@Controller("/v1/video-verification")
@ApiTags("Video Verification")
export class VideoVerificationController {
  constructor(private itmsService: ItmsService) {}

  @Get("/config")
  async getConfigAndValidity(
    @Req() req: Request,
    @Res() res: Response,
    @Query() queryParams: GetVideoConfigDto
  ) {
    try {
      const response: ConfigResponse =
        await this.itmsService.getVideoVerificationConfigs(queryParams);
      if (response?.data) {
        return sendResponse(
          req,
          res,
          200,
          "video verification configs",
          response?.data
        );
      }
    } catch (error) {
      return sendResponse(
        req,
        res,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "Error getting video configs and validity",
        error
      );
    }
  }

  @Post("/")
  async saveVideo(
    @Req() req: Request,
    @Res() res: Response,
    @Body() reqBody: VideoSubmitDto
  ) {
    try {
      const result = await this.itmsService.saveVideo(reqBody);
      return sendResponse(req, res, 200, "save video verification", result);
    } catch (error) {
      return sendResponse(
        req,
        res,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "Error saving video",
        error
      );
    }
  }

  @Post("/link")
  async createLink(
    @Req() req: Request,
    @Res() res: Response,
    @Body() reqBody: VideoVerificationLinkDto
  ) {
    try {
      const result = await this.itmsService.createVideoVerificationLink(
        reqBody
      );
      return sendResponse(
        req,
        res,
        200,
        "create video verification link",
        result
      );
    } catch (error) {
      return sendResponse(
        req,
        res,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        "Error getting video verification link",
        error
      );
    }
  }
}

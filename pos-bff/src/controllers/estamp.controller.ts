import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { sendResponse } from "../services/helpers/response-handler";
import { Request, Response } from "express";
import DocumentService from "../services/document-v2.service";
import { SaveEStampDto } from "../dtos/estamp/save-estamp.dto";
import { EStampService } from "../services/estamp.service";
import { UploadDto } from "../dtos/estamp/upload.dto";
import { UserAuth } from "../decorators/user-auth.decorator";
import { PosRoles } from "../constants/pos-roles.constants";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { GetEStampsDto } from "../dtos/estamp/get-estamp.dto";

@Controller("/v1/estamp")
@ApiTags("E-Stamp")
export class EStampController {
  constructor(
    private docService: DocumentService,
    private estampService: EStampService
  ) {}

  @Post("/upload")
  @ApiOperation({ summary: "Upload a single PDF containing multiple e-stamps" })
  @UseInterceptors(FileInterceptor("file"))
  async uploadEStamp(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UploadDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const ott = body.ott;
    const authToken = await this.docService.getTokenFromOtt(ott);
    if (!authToken) {
      throw new UnauthorizedException("auth token not found");
    }

    const result = await this.estampService.uploadEStamp(file);
    return sendResponse(req, res, HttpStatus.OK, "ok", {
      message: "E-Stamp uploaded",
      key: result,
    });
  }

  @Post()
  @ApiOperation({ summary: "Save E-Stamp in DB" })
  @UserAuth(PosRoles.SuperAdmin, PosRoles.Admin)
  async saveEStamp(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Body() body: SaveEStampDto
  ) {
    const result = await this.estampService.saveEStamp(body, req.userInfo.uuid);
    return sendResponse(req, res, HttpStatus.OK, "ok", result);
  }

  @Get()
  @ApiOperation({ summary: "Get E-Stamp List" })
  @UserAuth(PosRoles.SuperAdmin, PosRoles.Admin)
  async getEStamps(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Query() query: GetEStampsDto
  ) {
    const estamps = await this.estampService.getEStamp(query);
    return sendResponse(req, res, HttpStatus.OK, "ok", estamps);
  }
}

import { ApiTags } from "@nestjs/swagger";
import DocumentService from "../services/document-v2.service";
import { sendResponse } from "../services/helpers/response-handler";
import {
  Controller,
  HttpException,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request, Response } from "express";

@Controller("/v2")
@ApiTags("Document")
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Post("/upload-document")
  @UseInterceptors(FileInterceptor("file"))
  async uploadDocument(
    @Req() request: any,
    @Res() response: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    const ott = request?.body?.ott;
    const authToken = await this.documentService.getTokenFromOtt(ott);
    if (!authToken) {
      throw new HttpException("auth token not found", 401);
    }
    const data: any = await this.documentService.uploadDoc(file, authToken);
    return sendResponse(
      request,
      response,
      200,
      "Document Uploaded Successfully",
      data
    );
  }

  @Post("/ott")
  async generateOtt(@Req() request: Request, @Res() response: Response) {
    const authToken = request.headers.authorization;
    if (!authToken) {
      throw new HttpException("auth token not found", 401);
    }
    const ott = await this.documentService.generateOtt(authToken);

    return sendResponse(request, response, 200, "OTT saved", ott);
  }
}

import { UploadedFileDto } from "./../dtos/file";
import UploadHitService from "@/services/upload-hit-service";
import ConfigService from "@/services/config-service";
import UploadService from "@/services/upload-service";
import { sendResponse } from "@/services/helpers/response-handler";
import { logger } from "@/utils/logger";
import { Request, Response } from "express";
import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
} from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";
import { Inject, Service } from "typedi";
import UploadFileFacade from "@/facades/upload-file.facade";
import CommonUtils from "@/utils/common-utils";

@Service()
@Controller("/v1")
export class UploadController {
  @Inject()
  configService: ConfigService;
  @Inject()
  uploadHitService: UploadHitService;
  @Inject()
  uploadService: UploadService;
  @Inject()
  uploadFileFacade: UploadFileFacade;

  @Post("/upload")
  @OpenAPI({
    summary: "Triggers upload API",
    requestBody: {
      description: "produces rabbitMq parent and consumes the child",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              email: "prerit.singh@insurancedekho.com",
              file: {
                link: "https://ifm-v2.s3.amazonaws.com/stage/bff/1690117388658_ruleuploaderb2c.xlsx",
                extension: "xlsx",
              },
              source: "IFM",
              type: "rulesCreation",
              apiParams: {
                domainId: "motor",
                txnType: "payout",
                categoryCode: "motor-total",
              },
            },
          },
        },
      },
    },
  })
  async handleUpload(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFile("file") file: any
  ) {
    const body = req.body;
    for (const key in body) {
      if (CommonUtils.isJsonStringV2(body[key])) {
        body[key] = JSON.parse(body[key]);
      }
    }
    req.body = body;

    //get and validate the config
    const configKey = `${req.body.type}Upload`;
    const headers = req.headers;
    const { config } =
      (await this.configService.getConfigValueByKey(configKey)) ?? {};

    const requestFile: UploadedFileDto = {
      file: file ?? body?.file?.link,
      type: file ? "File" : "Link",
      extension: config.configValue?.dataStoreType ?? body?.file?.extension,
    };

    //create s3 link the link
    const s3FileLink = await this.uploadFileFacade.uploadFile(requestFile);

    const message = await this.uploadHitService.initiateParentHit(
      config,
      s3FileLink,
      body,
      headers
    );

    return sendResponse(req, res, 200, "ok", message);
  }

  @Get("/status/:configKey")
  async getStatus(
    @Param("configKey") configKey: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const status = await this.uploadService.getParentReqLogByKey(configKey);

      return sendResponse(req, res, 200, "OK", {
        status: status,
      });
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      logger.error("Error in getStatus controller", { error });
      // Return a 500 Internal Server Error status for any other errors
      return sendResponse(req, res, 500, "Internal Server Error", {
        message: err.message || err.stack,
      });
    }
  }
}

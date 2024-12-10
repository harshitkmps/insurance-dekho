import { sendResponse } from "@/services/helpers/response-handler";
import { logger } from "@/utils/logger";
import { Request, Response } from "express";
import { Controller, Get, Post, Req, Res } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";
import { Inject, Service } from "typedi";
import DownloadService from "@/services/download-service";
import ConfigService from "@/services/config-service";
import CommonUtils from "@/utils/common-utils";
import UploadService from "@/services/upload-service";

@Service()
@Controller("/v1/download")
export class DownloadController {
  @Inject()
  private downloadService: DownloadService;
  @Inject()
  private configService: ConfigService;
  @Inject()
  private uploadService: UploadService;

  @Get("/file")
  async downloadAWSFile(@Req() req: Request, @Res() res: Response) {
    try {
      logger.debug("received file for download ", req.query.fileUrl);
      const fileUrl = req.query.fileUrl as string;
      const filePath = new URL(fileUrl).pathname.slice(1);
      const signedUrl = await this.uploadService.getSignedDownloadURL(
        decodeURIComponent(filePath)
      );
      return sendResponse(req, res, 200, "ok", { signedUrl });
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      logger.error("error in download controller", { error });
      return sendResponse(
        req,
        res,
        err.status || 500,
        "error",
        err.message || err.stack
      );
    }
  }

  @Post("/*")
  @OpenAPI({
    summary: "Triggers download API",
    requestBody: {
      description: "produces rabbitMq parent and consumes the child",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              apiParams: {
                filters: {
                  createdDateRange: {
                    startDate: "2022-11-04",
                    endDate: "2022-11-04",
                  },
                  searchValue: "",
                  vehicleType: "8",
                  bucket: "proposal_pending",
                  policyNumber: "",
                  policyMedium: "online",
                },
                productType: "Motor",
              },
              requestSource: "POS",
              name: "test ifm points two",
              email: "test5647@gmail.com",
              uuid: "abc-def-jgwioru",
            },
          },
        },
      },
    },
  })
  async downloadData(@Req() req: Request, @Res() res: Response) {
    try {
      logger.debug(`request received for downloadData`, {
        body: req.body,
        params: req.params?.[0],
      });

      const data = {
        success: true,
        message: "You will receive an email when the data is ready.",
      };
      const configKey = `${req.body.type}Download`;
      const { success, config, error } =
        (await this.configService.getConfigValueByKey(configKey)) ?? null;

      if (!success) {
        const data = {
          success: false,
          message: error,
        };
        return sendResponse(req, res, 400, "Bad Request", data);
      }
      data.message = await this.downloadService.getDownloadData(
        req.body,
        req.params[0],
        config.configValue,
        req.headers.authorization
      );
      return sendResponse(req, res, 200, "OK", data);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      logger.error("error in download controller", { error });
      return sendResponse(
        req,
        res,
        err.status || 500,
        "error",
        err.message || err.stack
      );
    }
  }
}

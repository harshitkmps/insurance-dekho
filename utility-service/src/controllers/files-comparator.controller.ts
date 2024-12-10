import { AddCompareFilesBody } from "@/dtos/compare-files.dto";
import ConfigService from "@/services/config-service";
import { FilesComparatorService } from "@/services/files-comparator.service";
import { sendResponse } from "@/services/helpers/response-handler";
import { Request, Response } from "express";
import { Body, Controller, Post, Req, Res } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";
import { Inject, Service } from "typedi";

@Controller("/v1/compare/files")
@Service()
export class FilesComparatorController {
  @Inject()
  private filesComparatorService: FilesComparatorService;
  @Inject()
  private configService: ConfigService;

  @Post()
  @OpenAPI({
    summary: "Compare Files line by line",
  })
  async compareFiles(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: AddCompareFilesBody
  ) {
    const data = {
      success: true,
      message: "You will receive an email when the comparison is finished",
    };
    const configKey = body.type;
    const { success, config, error } =
      (await this.configService.getConfigValueByKey(configKey)) ?? null;

    if (!success) {
      const data = {
        success: false,
        message: error,
      };
      return sendResponse(req, res, 400, "Bad Request", data);
    }
    await this.filesComparatorService.produceParentHit(body, config);
    return sendResponse(req, res, 200, "ok", data);
  }
}

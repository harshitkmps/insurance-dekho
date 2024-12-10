import { sendResponse } from "@/services/helpers/response-handler";
import OnboradingService from "@/services/onboarding-service";
import CommonUtils from "@/utils/common-utils";
import { logger } from "@/utils/logger";
import { HTTP_MESSAGE, HTTP_STATUS_CODE } from "@/constants/http.constants";
import { Request, Response } from "express";
import { Controller, Get, Post, Req, Res } from "routing-controllers";
import { Inject, Service } from "typedi";
import ConfigService from "@/services/config-service";
import { configKeys } from "@/constants/config.constants";
import { GST_CONSTANT } from "@/constants/gst.constants";

@Service()
@Controller("/v1")
export class OnboardingController {
  @Inject()
  private onboardingService: OnboradingService;
  @Inject()
  private configService: ConfigService;

  @Get("/report/gst-applicable-partner")
  async fetchGSTDetails(@Req() req: Request, @Res() res: Response) {
    try {
      logger.info("request received for fetching GST Details");
      const data = this.onboardingService.fetchGSTDetails();
      return sendResponse(req, res, HTTP_STATUS_CODE.OK, HTTP_MESSAGE.OK, data);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      logger.error("error in onboarding gst controller", error);
      return sendResponse(
        req,
        res,
        err.status || HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        HTTP_MESSAGE.ERROR,
        err.message || err.stack
      );
    }
  }

  @Post("/report/gst-applicable-partner-mail")
  async sendGSTDetails(@Req() req: Request, @Res() res: Response) {
    try {
      logger.info("Sending GST Details in a mail");
      const { success, config, error } =
        (await this.configService.getConfigValueByKey(
          configKeys.GST_APPLICABLE_PARTNERS
        )) ?? null;
      if (!success || !config.configValue[GST_CONSTANT.TYPE]) {
        const data = {
          success: false,
          message: error,
        };
        return sendResponse(
          req,
          res,
          HTTP_STATUS_CODE.BAD_REQUEST,
          HTTP_MESSAGE.BAD_REQUEST,
          data
        );
      }
      const sendMailDetails = config.configValue[GST_CONSTANT.TYPE];
      await this.onboardingService.sendGSTDetails(req.body, sendMailDetails);
      return sendResponse(req, res, HTTP_STATUS_CODE.OK, HTTP_MESSAGE.OK, {});
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      logger.error("error in sending gst details  controller", error);
      return sendResponse(
        req,
        res,
        err.status || 500,
        HTTP_MESSAGE.ERROR,
        err.message || err.stack
      );
    }
  }
}

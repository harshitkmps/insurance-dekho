import v8 from "v8";
import Config from "@/models/mongo/config.schema";
import ConfigService from "@/services/config-service";
import { sendResponse } from "@/services/helpers/response-handler";
import { logger } from "@/utils/logger";
import { Request, Response } from "express";
import { Controller, Get, Post, Req, Res } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";
import { Inject, Service } from "typedi";
import CommonUtils from "@/utils/common-utils";
import { Cache } from "@/config/cache-store";

@Service()
@Controller("/v1/config")
export class ConfigController {
  @Inject()
  configService: ConfigService;
  @Inject()
  cache: Cache;

  @Post("")
  @OpenAPI({
    summary: "Inserts Config in DB",
    security: [{ bearer: [] }],
    requestBody: {
      description: "insert config in DB",
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
  async addConfig(@Req() req: Request, @Res() res: Response): Promise<any> {
    try {
      const { configKey, configValue, status } = req.body;
      logger.debug("add config controller", { body: req.body });
      if (!configKey || !configValue) {
        return sendResponse(req, res, 400, "error", {
          message: "Config Key or Config Value is missing",
        });
      }

      const config = await Config.findOneAndUpdate(
        { configKey },
        { configValue, status },
        { new: true, upsert: true }
      );

      this.cache.del([`__utility__getConfigValueByKey__${configKey}`]);

      logger.info("config updated", { id: config._id });
      return sendResponse(req, res, 200, "ok", {
        id: config._id,
        message: "Config updated/inserted",
      });
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      logger.error("error in add config controller", { error });
      return sendResponse(req, res, err.status || 500, "error", {
        message: err.message || err.stack,
      });
    }
  }

  @Get("/")
  @OpenAPI({
    summary: "Gets config from DB on the basis of key or all configs",
  })
  async getConfig(@Req() req: Request, @Res() res: Response): Promise<any> {
    try {
      const configKey: any = req.query.configKey;
      logger.debug("get config controller", { query: req.query });

      let config = null;
      if (configKey) {
        const configData = await this.configService.getConfigValueByKey(
          configKey
        );
        config = configData.config;
      } else {
        config = await Config.find().lean();
      }

      return sendResponse(req, res, 200, "ok", config);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      logger.error("error in get config controller", { error });
      return sendResponse(req, res, err.status || 500, "error", {
        message: err.message || err.stack,
      });
    }
  }

  @Get("/heap-statistics")
  @OpenAPI({
    summary: "Get heap statistics",
  })
  public async getHeapStatistics(@Req() req: Request, @Res() res: Response) {
    try {
      const heapStatistics = v8.getHeapStatistics();
      return sendResponse(req, res, 200, "ok", { heapStatistics });
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      console.error("error while getting heap statistics", { err });
      return sendResponse(
        req,
        res,
        err?.response?.status || 500,
        "error",
        error
      );
    }
  }
}

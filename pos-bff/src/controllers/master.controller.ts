import { Controller, Get, Post, Req, Res } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { sendResponse } from "../services/helpers/response-handler";
import CommonUtils from "../utils/common-utils";
import MasterAPIService from "../services/master-service";
import ItmsService from "../core/api-helpers/itms-service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { Response } from "express";

@Controller("/v1/master")
@ApiTags("Master")
export class MasterController {
  constructor(
    private masterApiService: MasterAPIService,
    private itmsService: ItmsService
  ) {}

  @Get("/cv-insurers")
  @ApiOperation({
    summary: "get cv insurers supporting cv revamp",
  })
  async getCvInsurersList(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const params = {};
      const insurersList = await this.masterApiService.getCVInsurers(params);
      return sendResponse(req, res, 200, "ok", { insurers: insurersList });
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in motor offline auto fill mmv details", {
        error,
        leadId: req.query.leadId,
        uuid: req.userInfo?.uuid,
        dealerId: req.query?.dealerId,
      });
      return res
        .status(err?.response?.status || err.status || 500)
        .json(err.response);
    }
  }

  @Get("/itms-config")
  @ApiOperation({
    summary: "get itms config",
    parameters: [
      {
        name: "configs",
        in: "query",
        example:
          "G_OFF_PVT_CAR_REASONS,INSURER_ALLOWED_PAYMENT_MODE,ADD_ONS_BY_VEHICLE_TYPE,G_OFFLINE_CASE_REASONS",
        required: false,
      },
    ],
  })
  async getITMSConfig(@Req() req: any, @Res() res: any) {
    const offlineResponse = await this.itmsService.getITMSConfig(req.query);
    return sendResponse(req, res, 200, "itms config details", offlineResponse);
  }

  @Get(["/br1/*", "/br2/*"])
  @ApiOperation({
    summary: "get master config data",
    parameters: [
      { name: "type", in: "path", example: "common" },
      { name: "name", in: "path", example: "getConfigData" },
      { name: "fetchData", in: "query", example: "config" },
      {
        name: "configName",
        in: "query",
        example: "commercialVehicleCategorySubCategoryDetails",
        required: false,
      },
    ],
  })
  async getMasterConfigDataGet(@Req() req: any, @Res() res: any) {
    const path = req.path.split("/api/v1/master/")[1];
    const data = await this.masterApiService.getMasterConfigData(
      path,
      req.query,
      req.method
    );
    return sendResponse(req, res, 200, "ok", { data });
  }

  @Post(["/br1/*", "/br2/*"])
  @ApiOperation({
    summary: "get master config data",
    parameters: [
      { name: "type", in: "path", example: "common" },
      { name: "name", in: "path", example: "getConfigData" },
      { name: "fetchData", in: "query", example: "config" },
      {
        name: "configName",
        in: "query",
        example: "commercialVehicleCategorySubCategoryDetails",
        required: false,
      },
    ],
  })
  async getMasterConfigDataPost(@Req() req: any, @Res() res: any) {
    const path = req.path.split("/api/v1/master/")[1];
    const data = await this.masterApiService.getMasterConfigData(
      path,
      req.body,
      req.method
    );
    return sendResponse(req, res, 200, "ok", { data });
  }
}

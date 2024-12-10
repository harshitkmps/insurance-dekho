import {
  Controller,
  Post,
  Req,
  Res,
  Get,
  Body,
  ValidationPipe,
  UsePipes,
} from "@nestjs/common";
import { sendResponse } from "../services/helpers/response-handler";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Logger } from "@nestjs/common";
import GridPointService from "../services/grid-point-service";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { Request, Response } from "express";
import { DownloadGridPointsDto } from "../dtos/grid/grid-download.dto";
import { PosRoles } from "../constants/pos-roles.constants";

@Controller("/v1/grid-point")
@ApiTags("Grid Points")
export class GridPointController {
  constructor(private gridPointService: GridPointService) {}

  @Post("/")
  @ApiOperation({
    summary: "get grid points from IFM",
  })
  @UserAuth()
  async getGridPointsData(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const body = req.body;
      const userInfo = req.userInfo;
      Logger.debug("creating grid points params", { body });
      const data = await this.gridPointService.getGridPointsData(
        body,
        userInfo
      );
      return sendResponse(req, res, 200, "ok", data);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }

  @Get("/show-grid-point")
  @UserAuth()
  async checkGridPointVisible(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const showGridPointAndDownload =
        await this.gridPointService.checkGridPointOrDownloadGridVisible(
          req.userInfo
        );

      return sendResponse(req, res, 200, "ok", {
        showGridPoint: showGridPointAndDownload?.isGridEligible,
        showDownloadGridPoint: showGridPointAndDownload?.isDownloadEligible,
      });
    } catch (err) {
      Logger.error("error in show grid point API", { err });
      return sendResponse(req, res, err?.response?.status || 500, "error", {
        err: err?.response || err,
      });
    }
  }
  @Get("/rto-list")
  async getGridPointRtoList(@Req() req: Request, @Res() res: Response) {
    try {
      const gridRtoList = await this.gridPointService.getGridPointRtoList();
      return sendResponse(req, res, 200, "ok", gridRtoList);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }
  @Get("/fuel-list")
  async getGridFuelTypeList(@Req() req: Request, @Res() res: Response) {
    try {
      const fuelTypeList = await this.gridPointService.getGridFuelTypeList();
      return sendResponse(req, res, 200, "ok", fuelTypeList);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }
  @Get("/insurer-list")
  async getGridInsurerTypeList(@Req() req: Request, @Res() res: Response) {
    try {
      const insurerTypeList =
        await this.gridPointService.getGridInsurerTypeList();
      return sendResponse(req, res, 200, "ok", insurerTypeList);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }
  @Get("/policy-list")
  async getGridPolicyTypeList(@Req() req: Request, @Res() res: Response) {
    try {
      const policyTypeList =
        await this.gridPointService.getGridPolicyTypeList();
      return sendResponse(req, res, 200, "ok", policyTypeList);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }
  @Get("/vehicle-type-list")
  async getGridvehicleTypeList(@Req() req: Request, @Res() res: Response) {
    try {
      const vehicleTypeList =
        await this.gridPointService.getGridvehicleTypeList();
      return sendResponse(req, res, 200, "ok", vehicleTypeList);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }
  @Get("/dependent-fields-list")
  async getDependentFieldsList(@Req() req: Request, @Res() res: Response) {
    try {
      const query: any = req.query;
      const { vehicleType, vehicleSubType, insurer } = query;

      const responseData = await this.gridPointService.getDependentFieldsList(
        vehicleType,
        insurer,
        vehicleSubType
      );

      return sendResponse(req, res, 200, "ok", responseData);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }
  @Get("/model-list")
  @ApiOperation({
    summary: "Get Model List from IFM",
  })
  async getModelList(@Req() req: Request, @Res() res: Response) {
    try {
      const query: any = req.query;
      const { vehicleType, vehicleSubType, makeHierarchy, insurer } = query;
      const modelList = await this.gridPointService.getModelList(
        vehicleType,
        vehicleSubType,
        makeHierarchy,
        insurer
      );
      return sendResponse(req, res, 200, "ok", modelList);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }
  @Get("/team-wise-product-mapping")
  @UserAuth(PosRoles.Agent)
  @ApiOperation({
    summary: "Get Team Wise Product Mapping",
  })
  public async getTeamWiseProductMapping(
    @Req() req: ReqWithUser,
    @Res() res: Response
  ) {
    try {
      const teamRmMapping = req.userInfo?.team_rm_mapping;
      Logger.debug("team-wise product mapping params", { teamRmMapping });

      const result = await this.gridPointService.getTeamWiseProductMapping(
        teamRmMapping
      );
      return sendResponse(req, res, 200, "ok", result);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }

  @Get("/sales-zones")
  @UserAuth()
  @ApiOperation({
    summary: "Get Zone ID of sales Member",
  })
  async getZonesForSales(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const query: any = req.query;
      const { teamUuid, projection } = query;
      const userInfo = req.userInfo;
      const zoneId = await this.gridPointService.getZonesForSales(
        teamUuid,
        projection,
        userInfo
      );
      return sendResponse(req, res, 200, "ok", zoneId);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }

  @Post("/download")
  @ApiOperation({
    summary: "Download Grid from IFM",
  })
  @UserAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  async downloadGridPoints(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Body() body: DownloadGridPointsDto
  ) {
    try {
      const userInfo = req.userInfo;
      Logger.debug("download grid points params", { body });
      const data = await this.gridPointService.downloadGridPoints(
        body,
        userInfo
      );
      return sendResponse(req, res, 200, "ok", data);
    } catch (err) {
      return sendResponse(req, res, err.status || 500, "error", err.response);
    }
  }
}

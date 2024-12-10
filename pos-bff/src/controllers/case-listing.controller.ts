import GenericAPIService from "../services/generic-api-service";
import { sendResponse } from "../services/helpers/response-handler";
import MasterAPIService from "../services/master-service";
import {
  Post,
  Req,
  Res,
  Get,
  Controller,
  Logger,
  HttpException,
} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { properties } from "../config/properties";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";

@Controller()
@ApiTags("Case Listing")
export class CaseListingController {
  constructor(
    private genericService: GenericAPIService,
    private masterApiService: MasterAPIService
  ) {}

  @Post("/get-data")
  @UserAuth()
  @ApiOperation({
    summary: "Return cases for different products",
    requestBody: {
      description: "return data based on view specified",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              meta: {
                view: "pet-case-listing",
              },
              filters: {},
              limit: 10,
            },
          },
        },
      },
    },
  })
  async getCaseListing(@Req() request: Request, @Res() response: Response) {
    const propertiesMap = properties[request.body.meta.view];
    if (!propertiesMap) {
      throw new HttpException("view is undefined or not configured", 400);
    }
    propertiesMap.options.config.headers["x-api-key"] = request.headers[
      "x-api-key"
    ]
      ? request.headers["x-api-key"]
      : uuidv4();
    propertiesMap.options.config.headers["x-correlation-id"] = request.headers[
      "x-correlation-id"
    ]
      ? request.headers["x-correlation-id"]
      : uuidv4();
    const data = await this.genericService.getData(request, propertiesMap);
    return sendResponse(request, response, 200, "ok", data);
  }

  @Get("/master/masterData")
  @ApiOperation({
    summary: "Return master list for different products",
    parameters: [
      {
        name: "subProductTypeId",
        in: "query",
        example: "7",
        description: "travel:7; pet:8",
      },
      {
        name: "subSource",
        in: "query",
        example: "POS",
        description: "POS",
      },
      {
        name: "source",
        in: "query",
        description: "INSURANCEDEKHO",
      },
      {
        name: "masterType",
        in: "query",
        description: "insurer,breeds",
        example: "insurer",
      },
    ],
  })
  async getMasterData(@Req() request: Request, @Res() response: Response) {
    Logger.debug("fetching master data");
    const data = await this.masterApiService.getMasterData(request.query);
    return sendResponse(request, response, 200, "ok", data);
  }
}

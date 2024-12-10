import { Controller, Get, Req, Res, Logger } from "@nestjs/common";
import IdedgeService from "../services/idedge-service";
import { sendResponse } from "../services/helpers/response-handler";
import {
  ACCEPTED_PRODUCT_TYPE_FOR_CHUNKS,
  ACCEPTED_RESOURCES,
} from "../constants/config.constants";
import { ApiTags } from "@nestjs/swagger";

@Controller("/v1/idedge")
@ApiTags("ID Edge")
export class IdedgeController {
  constructor(private idedgeService: IdedgeService) {}

  @Get("/chunks")
  async getUpdatedChunks(@Req() request: any, @Res() response: any) {
    const acceptedProductTypes = ACCEPTED_PRODUCT_TYPE_FOR_CHUNKS;
    const productType = request?.query?.productType;
    if (productType && acceptedProductTypes.includes(productType)) {
      const data = await this.idedgeService.getUpdatedChunks(request);
      return sendResponse(request, response, 200, "ok", data);
    } else {
      return sendResponse(
        request,
        response,
        400,
        `Accepted product types are required: ${acceptedProductTypes} `,
        {}
      );
    }
  }

  @Get("/resources")
  async getResources(@Req() request: any, @Res() response: any) {
    Logger.debug("received request ", { params: request.query });
    const acceptedResources = ACCEPTED_RESOURCES;
    const resourceType = request?.query?.resourceType;
    if (resourceType && acceptedResources.includes(resourceType)) {
      const logoUrls = await this.idedgeService.getResources(request);
      Logger.debug("Sending following response insurer logos", logoUrls);
      return sendResponse(request, response, 200, "ok", logoUrls);
    } else {
      return sendResponse(
        request,
        response,
        400,
        `Accepted resources are required: ${acceptedResources} `,
        {}
      );
    }
  }
}

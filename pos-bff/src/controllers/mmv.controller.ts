import { Controller, Get, Req, Res } from "@nestjs/common";
import MMVService from "../services/mmv-service";
import { sendResponse } from "../services/helpers/response-handler";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller("/v1/mmv")
@ApiTags("MMV")
export class MMVController {
  constructor(private MMVService: MMVService) {}

  @Get("/get-mmv")
  @ApiOperation({
    summary: "Get MMV Data of Particular Vehicle Type",
  })
  async getMmvData(@Req() req: any, @Res() res: any) {
    try {
      const vehicleType = req.query?.vehicleType;
      const categoryId = req.query?.categoryId ?? "";
      const insurerId = req.query?.insurerId ?? "";
      const mmvData = await this.MMVService.getMMVData(
        vehicleType,
        insurerId,
        categoryId
      );
      return sendResponse(req, res, 200, "ok", mmvData);
    } catch (error) {
      return sendResponse(req, res, 400, "Some Error has occurred.", "");
    }
  }

  @Get("/get-mmv-make-model")
  @ApiOperation({
    summary: "Get MMV Make Data of Particular Vehicle Type",
  })
  async getMmvMakeModel(@Req() req: any, @Res() res: any) {
    try {
      const vehicleType = req.query?.vehicleType;
      const categoryId = req.query?.categoryId ?? "";
      const insurerId = req.query?.insurerId ?? "";
      const makeId = req.query?.makeId ?? "";
      const mmvData = await this.MMVService.getMMVMakeModel(
        vehicleType,
        insurerId,
        categoryId,
        makeId
      );
      return sendResponse(req, res, 200, "ok", mmvData);
    } catch (error) {
      return sendResponse(req, res, 400, "Some Error has occurred.", "");
    }
  }
}

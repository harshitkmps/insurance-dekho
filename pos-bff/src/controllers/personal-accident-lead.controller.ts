import { Controller, Post, Req, Res } from "@nestjs/common";
import { sendResponse } from "../services/helpers/response-handler";
import { Logger } from "@nestjs/common";
import LeadAddService from "../services/lead-add-service";
import QuotesService from "../services/quotes-service";
import { LeadMiddlewareService } from "../core/api-helpers/lead-middleware.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller("/v1/personal-accident")
@ApiTags("Personal Accident Lead")
export class PersonalAccidentLeadController {
  constructor(
    private leadAddService: LeadAddService,
    private quotesService: QuotesService,
    private lmwService: LeadMiddlewareService
  ) {}

  @Post("/leads")
  @ApiOperation({
    summary: "Create Personal Accident Lead",
  })
  async addLead(@Req() req: any, @Res() res: any) {
    Logger.debug("Add Personal Accident Lead", req.body);
    const response = await this.leadAddService.addPersonalAccidentLead(
      req.body
    );
    Logger.debug("Response Add PA Lead", response);
    return sendResponse(req, res, 200, "ok", response);
  }

  @Post("/quotes")
  @ApiOperation({
    summary: "Get PA Quotes",
  })
  async getQuotes(@Req() req: any, @Res() res: any) {
    const response = await this.quotesService.getHealthQuotes(req.body);
    Logger.debug("Response PA Quotes", response);
    return sendResponse(req, res, 200, "ok", response);
  }

  @Post("/quotes/selected-quote")
  @ApiOperation({
    summary: "Get PA Quotes",
  })
  async fetchSelectedQuote(@Req() req: any, @Res() res: any) {
    Logger.debug("Get Personal Accident Selected Quote");
    const response = await this.quotesService.fetchSelectedQuote(req.body);
    if (!response.success) {
      return sendResponse(req, res, 400, "error", { errors: response.errors });
    }
    return sendResponse(req, res, 200, "ok", response.data);
  }

  @Post("/quotes/selected-addons")
  @ApiOperation({
    summary: "Get PA Selected Addons",
  })
  async selectAddons(@Req() req: any, @Res() res: any) {
    Logger.debug("Get Personal Accident Selected Addons");
    const response = await this.quotesService.selectAddons(req.body);
    Logger.debug("Response PA Selected Addon", response);
    if (!response.success) {
      return sendResponse(req, res, 400, "error", response);
    }
    return sendResponse(req, res, 200, "ok", response.data);
  }

  @Post("/cart/add")
  @ApiOperation({
    summary: "Add to PA Cart",
  })
  async addToCart(@Req() req: any, @Res() res: any) {
    Logger.debug("Add to cart PA");
    const response = await this.lmwService.addToCart(req.body);
    Logger.debug("Response PA Selected Quote", response);
    return sendResponse(req, res, 200, "ok", response);
  }
}

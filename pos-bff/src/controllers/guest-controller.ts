import { sendResponse } from "../services/helpers/response-handler";
import { Request, Response } from "express";
import { Controller, Post, Req, Res, Logger } from "@nestjs/common";
import GuestService from "../services/guest-service";
import { ApiTags } from "@nestjs/swagger";

@Controller()
@ApiTags("Guest")
export class GuestController {
  constructor(private guestService: GuestService) {}

  @Post("/guests")
  async intiateGuestLogin(@Req() req: Request, @Res() res: Response) {
    Logger.debug("Received following params for guest login", req.body);
    const response = await this.guestService.validateGuest(req);
    const cookies = response?.["set-cookie"];
    res.setHeader("set-cookie", cookies);
    Logger.debug(JSON.stringify(res.getHeaders()));
    return sendResponse(req, res, 200, "ok", res.getHeaders());
  }
}

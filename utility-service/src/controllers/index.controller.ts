import authMiddleware from "@/middlewares/auth.middleware";
import { sendResponse } from "@/services/helpers/response-handler";
import { logger } from "@/utils/logger";
import { Request, Response } from "express";
import { Controller, Get, Req, Res, UseBefore } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";
import { Service } from "typedi";

@Service()
@Controller()
export class IndexController {
  @Get("/health")
  index() {
    return "OK";
  }

  @Get("/auth-test")
  @OpenAPI({
    security: [{ bearer: [] }],
  })
  @UseBefore(authMiddleware)
  authTest(@Req() req: Request, @Res() res: Response) {
    logger.info(`request with body `, req.body);
    return sendResponse(req, res, 200, "OK", {});
  }
}

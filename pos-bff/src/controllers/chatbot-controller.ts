import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import Policyservice from "../services/policy-service";
import { Response } from "express";
import {
  ChatbotPolicyDocRequestDto,
  RenewalChatbotPolicyDocRequestDto,
} from "../dtos/request/chatbot-policy.dto";
import { sendResponse } from "../services/helpers/response-handler";
import { JWTAuth } from "../decorators/jwt-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import IFMApiService from "../services/ifm-service";
import { TOKEN_TYPE } from "../constants/jwt-constants";
import PointsManagementService from "../services/points-management-service";

@Controller("")
@ApiTags("chatbot APIs")
export class ChatbotController {
  constructor(
    private policyservice: Policyservice,
    private ifmservice: IFMApiService,
    private pointsManagementService: PointsManagementService
  ) {}

  @Get("/chatbot/policy-doc")
  @JWTAuth(TOKEN_TYPE.CHATBOT)
  async getPolicyDoc(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Query() params: ChatbotPolicyDocRequestDto
  ) {
    const response = await this.policyservice.getPolicyDoc(
      params.policyNumber,
      req.userInfo?.dealer_id,
      params.product
    );
    return sendResponse(
      req,
      res,
      200,
      "policy doc fetched successfully",
      response
    );
  }

  @Get("/chatbot/gridpoint-score")
  @JWTAuth(TOKEN_TYPE.CHATBOT)
  async getPartnerScore(@Req() req: ReqWithUser, @Res() res: Response) {
    const uuid = req.userInfo?.uuid;
    if (!uuid) {
      throw new UnauthorizedException("User not authorised");
    }
    const data = await this.ifmservice.getAvailableScore(uuid);
    return sendResponse(
      req,
      res,
      200,
      "Available score fetched successfully",
      data
    );
  }

  @Post("/chatbot/score-card")
  @JWTAuth(TOKEN_TYPE.CHATBOT)
  async getScoreCard(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const uuid = req.userInfo?.uuid;
      if (!uuid) {
        throw new UnauthorizedException("User not authorised");
      }
      const quotesWithScores: any =
        await this.pointsManagementService.getScoreCardWithQuotes(
          req.body,
          req.userInfo
        );
      return sendResponse(req, res, 200, "ok", quotesWithScores);
    } catch (error) {
      return sendResponse(
        req,
        res,
        error.status || 500,
        "error",
        error?.response || error
      );
    }
  }

  @Get("/chatbot/renewal/get-renewal-links-data")
  @JWTAuth(TOKEN_TYPE.CHATBOT)
  async getRenewalLinksAndData(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Query() params: RenewalChatbotPolicyDocRequestDto
  ) {
    try {
      const response = await this.policyservice.getRenewalChatbotData(
        params?.policyNumber,
        params?.registrationNumber,
        req?.userInfo?.dealer_id,
        params?.product,
        params?.queryType,
        req?.userInfo?.email,
        req?.userInfo?.gcd_code
      );
      return sendResponse(
        req,
        res,
        200,
        "renewal links and data fetched successfully",
        response
      );
    } catch (error) {
      return sendResponse(
        req,
        res,
        400,
        error.message,
        error.response.response
      );
    }
  }
}

import { sendResponse } from "../services/helpers/response-handler";
import { Request, Response } from "express";
import { Controller, Post, Req, Res, Logger, Get } from "@nestjs/common";
import ApiPosService from "../services/apipos-service";
import ItmsService from "../core/api-helpers/itms-service";
import DealerService from "../services/dealer-service";
import CommonUtils from "../utils/common-utils";
import CommunicationService from "../services/communication-service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";

@Controller()
@ApiTags("Communication")
export class CommunicationController {
  constructor(
    private apiPosService: ApiPosService,
    private itmsService: ItmsService,
    private dealerService: DealerService,
    private communicationService: CommunicationService
  ) {}

  @Post("/communication/uploadLifeDocs")
  @UserAuth()
  async uploadLifeDocs(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      Logger.debug("Request for upload life Doc's Communication : ", {
        payload: req.body,
      });
      const url = req.body?.variables?.PPF_DOC_LINK;
      const shortenUrlResponse: any = await this.itmsService.shortenUrl(url);
      const shortenedUrl = shortenUrlResponse?.url;

      const hierarchy = await this.dealerService.fetchContactInfo({
        dealerId: req.userInfo?.dealer_id,
        medium: "POS",
      });
      const cc = [
        hierarchy?.bmDetails?.bm_email,
        hierarchy?.amDetails?.am_email,
        hierarchy?.zhDetails?.zh_email,
      ];
      cc.forEach((agent, index) => {
        if (CommonUtils.isEmpty(agent)) {
          cc[index] = "";
        }
      });

      const reqBody = { ...req.body };
      reqBody.cc = cc;
      reqBody.variables.PPF_DOC_LINK = shortenedUrl;

      await this.apiPosService.sendCommunication(
        reqBody,
        req.headers?.authorization
      );

      return sendResponse(
        req,
        res,
        200,
        "ok",
        req.body.type + " sent successfully."
      );
    } catch (err) {
      Logger.error(
        `Error while sending upload life docs communication: ${err}`
      );
      return res
        .status(500)
        .json({ error: err?.response || err, success: false });
    }
  }

  @Post("/communication/send-otp")
  async otpHandler(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug("Request on otp service with following params", req.body);
      const response = await this.communicationService.sendOtp(req.body);
      return sendResponse(req, res, 200, "ok", response);
    } catch (error) {
      Logger.error(`Error sending otp`, error);
      return sendResponse(
        req,
        res,
        error?.response?.status ?? error?.status ?? 400,
        error?.response?.message ?? error?.message ?? `Error sending otp`,
        error
      );
    }
  }

  @Post("/communication/verify-otp")
  async otpVerifier(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug("Request on otp service with following params", req.body);
      const body = req.body;
      const { authCode, otp } = body;
      const response = await this.communicationService.verifyOtp(otp, authCode);
      return sendResponse(req, res, 200, "ok", response);
    } catch (error) {
      Logger.error(`Error while verification`, error);
      return sendResponse(
        req,
        res,
        error?.response?.status ?? error?.status ?? 400,
        error?.response?.message ??
          error?.message ??
          `Error while verification`,
        error
      );
    }
  }

  @Post("/share-documents")
  async shareDocuments(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug(
        "Request to share documents with following params",
        req.body
      );
      const body = req.body;
      const response = await this.communicationService.shareDocuments(body);
      return sendResponse(req, res, 200, "ok", response);
    } catch (error) {
      Logger.error("Error while sharing documents", error);
      return sendResponse(
        req,
        res,
        error?.response?.status ?? error?.status ?? 400,
        error?.response?.message ??
          error?.message ??
          "Error while sharing documents",
        error
      );
    }
  }

  @Post("/share-link")
  async shareLink(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug("Request to share data with following params", req.body);
      const body = req.body;
      const response = await this.communicationService.shareLink(body);
      return sendResponse(req, res, 200, "ok", response);
    } catch (error) {
      Logger.error("Error while sharing link", error);
      return sendResponse(
        req,
        res,
        error?.response?.status ?? error?.status ?? 400,
        error?.response?.message ??
          error?.message ??
          "Error while sharing link",
        error
      );
    }
  }

  @Post("/share")
  async sharePageLink(@Req() req: Request, @Res() res: Response) {
    try {
      Logger.debug("Request to share link received", req.body);
      const body = req.body;
      const response = await this.communicationService.shareLinkService(body);
      return sendResponse(req, res, 200, "ok", response);
    } catch (error) {
      Logger.error("Error while sharing page link", error);

      return sendResponse(
        req,
        res,
        error?.response?.status ?? error?.status ?? 400,
        error?.response?.message ??
          error?.message ??
          "Error while sharing the page link",
        error
      );
    }
  }

  @Get("/communication/motor-payment-dropoff")
  @ApiOperation({
    summary: "Send payment dropoff communication to partners",
  })
  async motorPaymentDropoff(@Req() req: Request, @Res() res: Response) {
    try {
      const response = await this.communicationService.motorPaymentDropoff();
      return sendResponse(req, res, 200, "ok", response);
    } catch (error) {
      Logger.error(
        "Error while sharing communication for payment dropoff ",
        error
      );

      return sendResponse(
        req,
        res,
        error.status || 500,
        error?.message ??
          "Error while sharing commincation for payment dropoff",
        error
      );
    }
  }
}

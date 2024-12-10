import { Controller, Get, Req, Res } from "@nestjs/common";
import { Logger } from "@nestjs/common";
// import authMiddleware from "../middlewares/auth.middleware";
import { sendResponse } from "../services/helpers/response-handler";
import CommonUtils from "../utils/common-utils";
import SupportService from "../services/support-service";
import {
  ENDORSEMENT_TICKET_PAGE_DEFAULT,
  ISLAZY_LOAD_DEFAULT,
} from "../constants/support.constants";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { Response } from "express";

@Controller("/v1/support")
@ApiTags("Support")
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Get("/login")
  @UserAuth()
  @ApiOperation({
    summary: "Logs user into support",
  })
  async supportLogin(@Req() req: ReqWithUser, @Res() res: Response) {
    Logger.debug("support login req", {
      userInfo: req.userInfo,
    });
    try {
      const userInfo = req.userInfo;
      let supportData = await this.supportService.loginUserToSupport(
        userInfo.auth_token
      );
      const headers = {
        "x-auth-id": supportData.user_id,
        "x-auth-token": supportData.auth_token,
      };
      const validateCredentialsAndReloginUserToSupport =
        await this.supportService.validateAndReloginUserToSupport(
          headers,
          userInfo
        );
      if (validateCredentialsAndReloginUserToSupport) {
        supportData = validateCredentialsAndReloginUserToSupport;
      }
      Logger.debug("Support login credentials", supportData);
      const url = `${process.env.SUPPORT_BASE_URL}/login?userId=${supportData.user_id}&authToken=${supportData.auth_token}`;
      return sendResponse(req, res, 302, "OK", { url });
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in support login API", {
        error,
      });
      return res
        .status(err?.response?.status || err?.status || 500)
        .json({ message: err.response?.message || err.message || err });
    }
  }

  @Get("/endorsements")
  @UserAuth()
  async getEndorsements(@Req() req: ReqWithUser, @Res() res: Response) {
    Logger.debug("fetching endorsements for user", {
      userInfo: req.userInfo,
    });
    try {
      const userInfo = req.userInfo;

      const isEndorsementTicketsEnabledForUser =
        await this.supportService.checkEndorsementListingEligibility(userInfo);

      if (!isEndorsementTicketsEnabledForUser) {
        Logger.debug("endorsement tickets listing not enabled for role id", {
          posRoleId: userInfo.pos_role_id,
        });
        return sendResponse(req, res, 200, "Unauthorized access", {
          tickets: [],
        });
      }

      let userCredentialsForSupportLogin =
        await this.supportService.loginUserToSupport(userInfo.auth_token);

      const headers = {
        "x-auth-id": userCredentialsForSupportLogin.user_id,
        "x-auth-token": userCredentialsForSupportLogin.auth_token,
      };

      const validateCredentialsAndReloginUserToSupport =
        await this.supportService.validateAndReloginUserToSupport(
          headers,
          userInfo
        );
      if (validateCredentialsAndReloginUserToSupport) {
        userCredentialsForSupportLogin =
          validateCredentialsAndReloginUserToSupport;
      }

      Logger.debug(
        `User credentials for support login ${JSON.stringify(
          userCredentialsForSupportLogin
        )}`
      );

      if (!userCredentialsForSupportLogin) {
        const response = {
          tickets: [],
        };
        return sendResponse(
          req,
          res,
          400,
          "User credentials for support login not fetched from ITMS",
          response
        );
      }

      const params = {
        isLazyLoad: req.query?.isLazyLoad || ISLAZY_LOAD_DEFAULT,
        page: req.query?.page || ENDORSEMENT_TICKET_PAGE_DEFAULT,
      };

      const endorsementTicketsForMotor =
        await this.supportService.getEndorsementTicketsForMotor(
          params,
          headers,
          userCredentialsForSupportLogin
        );

      return sendResponse(req, res, 200, "OK", endorsementTicketsForMotor);
    } catch (err) {
      const error = CommonUtils.isJsonString(err);
      Logger.error("error in fetching endorsements", {
        error,
      });
      return res
        .status(err?.response?.status || err?.status || 500)
        .json({ message: err.response?.message || err.message || err });
    }
  }
}

import { sendResponse } from "../services/helpers/response-handler";
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Put,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { Request, Response } from "express";
import { Logger } from "@nestjs/common";
import ManageLeadService from "../services/manage-lead-service";
import IamService from "../services/iam-service";
import ItmsService from "../core/api-helpers/itms-service";
import ApiPosService from "../services/apipos-service";
import CpsService from "../services/cps-service";
import UserPhoneBookService from "../services/user-phone-book-service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import ConfigService from "../services/config-service";
import { PosInternalRoles, PosRoles } from "../constants/pos-roles.constants";
import UserService from "../services/user-service";
import {
  UpdateUserAddress,
  SearchUserRequestDto,
  SoftDeleteUserDto,
  UpdateUserBasicDetailsDto,
  UpdateUserBody,
} from "../dtos/request/user-request.dto";
import CommunicationService from "../services/communication-service";
import LOSService from "../services/los-service";
import TokenService from "../services/token.service";

@Controller()
@ApiTags("User")
export class UserController {
  constructor(
    private apiPosService: ApiPosService,
    private leadService: ManageLeadService,
    private iamService: IamService,
    private cpsService: CpsService,
    private itmsService: ItmsService,
    private userPhoneBookService: UserPhoneBookService,
    private configService: ConfigService,
    private userService: UserService,
    private communicationService: CommunicationService,
    private losService: LOSService,
    private tokenService: TokenService
  ) {}

  @Get("/user-details")
  @UserAuth()
  async userDetails(@Req() req: ReqWithUser, @Res() res: Response) {
    try {
      const userDetails = req.userInfo;
      if (userDetails?.auth_token) delete userDetails.auth_token;

      return sendResponse(req, res, 200, "ok", userDetails);
    } catch (err) {
      Logger.error(`error in user details ${err}`);
      return res
        .status(500)
        .json({ error: err?.response || err, success: false });
    }
  }

  @Post("/update-agent-details/bank")
  @UserAuth(PosRoles.Admin, PosRoles.SuperAdmin)
  async updateAgentBankDetails(@Req() req: Request, @Res() res: Response) {
    try {
      const userDetails = req.body;
      const payload = {
        beneficiary_name: userDetails.beneficiaryNameAtBank,
        ifsc_code: userDetails.ifsc,
        account_number: userDetails.accountNumber,
        uuid: userDetails.uuid,
        bank_name: userDetails.bankName,
      };
      const responseData: any = await this.apiPosService.updateAgentBankDetails(
        payload
      );
      return sendResponse(req, res, 200, "ok", responseData.data);
    } catch (err) {
      Logger.error(`error in editUserDetails ${JSON.stringify(err)}`);
      const msg = err?.response?.errors[0]?.message ?? err?.response?.message;
      return res.status(err.status || 500).json({
        error: msg,
        success: false,
      });
    }
  }

  @Post("/user/validate-bank-details")
  @UserAuth(PosRoles.Admin, PosRoles.SuperAdmin)
  public async verifyBankDetails(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const body = request.body;
    const uuid = body.uuid;
    if (!uuid) {
      throw new BadRequestException("uuid is mandatory parameter");
    }
    const userDetails = await this.apiPosService.fetchUserDetails(uuid, true);
    if (!userDetails) {
      throw new BadRequestException("active user details not found");
    }
    const pennyDropResponse = await this.losService.verifyBankDetails({
      beneficiaryAccountNumber: body.accountNumber,
      beneficiaryIFSC: body.ifsc,
      beneficiaryName: userDetails.last_name
        ? userDetails.first_name + userDetails.last_name
        : userDetails.first_name,
      beneficiaryMobile: userDetails?.mobile,
      beneficiaryEmail: userDetails?.email,
      beneficiaryAddress: userDetails?.address,
      uuid,
    });
    return sendResponse(
      request,
      response,
      200,
      "Bank details verified",
      pennyDropResponse
    );
  }

  @Post("/user/verifyBankAccount")
  @UserAuth(PosRoles.Agent, PosRoles.Admin, PosRoles.SuperAdmin)
  public async verifyBankAccount(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    try {
      const body = request.body;
      const userInfo = request.userInfo;
      const userDetails = {
        beneficiaryName: userInfo?.first_name + userInfo?.last_name,
        beneficiaryMobile: userInfo?.mobile,
        beneficiaryEmail: userInfo?.email,
        beneficiaryAddress: userInfo?.address,
        uuid: userInfo?.uuid,
      };
      if (
        [PosRoles.Admin, PosRoles.SuperAdmin].includes(userInfo.pos_role_id)
      ) {
        const uuid = body.uuid;
        if (!uuid) {
          throw new HttpException(`uuid is required`, HttpStatus.BAD_REQUEST);
        }
        const userBasicDetails = await this.apiPosService.fetchUserDetails(
          uuid,
          true
        );
        if (!userBasicDetails) {
          throw new HttpException(
            `user details not found for given uuid`,
            HttpStatus.BAD_REQUEST
          );
        }
        const name = userBasicDetails.last_name
          ? userBasicDetails.first_name + userBasicDetails.last_name
          : userBasicDetails.first_name;
        userDetails.uuid = uuid;
        userDetails.beneficiaryName = name;
        userDetails.beneficiaryMobile = userBasicDetails.mobile;
        userDetails.beneficiaryEmail = userBasicDetails.email;
        userDetails.beneficiaryAddress = userBasicDetails.address;
      }
      const bankUpdateResp = await this.userService.updateUserBankDetails({
        ...body,
        ...userDetails,
      });
      return sendResponse(
        request,
        response,
        200,
        "Bank Details Updated",
        bankUpdateResp
      );
    } catch (error) {
      Logger.error("Error occurred while updating user Bank details", {
        error,
      });
      return sendResponse(
        request,
        response,
        error.status || 500,
        error?.message || "Internal Server Error",
        error?.response || error
      );
    }
  }

  @Post("/sub-user")
  async createSubUser(@Req() req: Request, @Res() res: Response) {
    try {
      const userDetails = req.body;
      const responseData: any = await this.apiPosService.createSubUser(
        userDetails
      );
      return sendResponse(req, res, 200, "ok", responseData.data);
    } catch (err) {
      Logger.error(`error in createSubUser ${JSON.stringify(err)}`);
      return res
        .status(500)
        .json({ message: err.response?.message || err.message });
    }
  }

  @Post("/update-user-details")
  async updateUserDetails(@Req() req: Request, @Res() res: Response) {
    try {
      const userDetails = req.body;
      Logger.debug("userDetails ", { userDetails: userDetails });
      const leadResp = await this.leadService.leadSearchByMobileOrEmail(
        userDetails
      );

      Logger.debug("leadSearchByMobileOrEmail ", {
        leadSearchByMobileOrEmail: leadResp,
      });
      try {
        if (leadResp?.data?.data?.length > 0) {
          this.iamService.triggerEventAndIamSoftDelete(leadResp, userDetails);
        } else {
          this.iamService.iamUserSoftDeleteIfExistInCPS(userDetails);
        }
        const response = await this.iamService.updateIamUserDetails(
          userDetails
        );
        Logger.log("editIamUserDetailsResponse ", {
          editIamUserDetails: response,
        });
        return sendResponse(req, res, 200, "ok", response);
      } catch (error) {
        Logger.error("Error occurred in processing user details", { error });
        return sendResponse(
          req,
          res,
          500,
          "Internal Logic Updation Falied!",
          error?.response || error
        );
      }
    } catch (error) {
      Logger.error("Error occurred while updating user details", { error });
      return sendResponse(
        req,
        res,
        500,
        "Internal Server Error",
        error?.response || error
      );
    }
  }

  @Put("/user")
  @UserAuth(PosRoles.Agent)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateUser(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Body() body: UpdateUserAddress
  ) {
    try {
      const uuid = req?.userInfo?.uuid;
      Logger.debug(
        "Request to update agent's address with following params",
        req.body
      );
      if (!Object.keys(body).length) {
        throw new HttpException("update body is empty", HttpStatus.BAD_REQUEST);
      }
      await this.userService.updateUser(uuid, body);
      const response = {
        message: "Data updated successfully.",
      };
      return sendResponse(req, res, 200, "Success", response);
    } catch (error) {
      Logger.error("Error occurred while updating agent's address", { error });
      return sendResponse(
        req,
        res,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error?.message || "Internal Server Error",
        error?.response || error
      );
    }
  }

  @Post("/user/primary-details")
  @UsePipes(new ValidationPipe({ transform: true }))
  @UserAuth(PosRoles.Agent, PosRoles.SuperAdmin, PosRoles.Admin)
  async updateUserPrimaryDetails(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Body() body: UpdateUserBody
  ) {
    try {
      Logger.debug("Request on otp service with following params", req.body);
      const updateParams: any = { ...body };
      let isSelfUpdate = true;
      if (
        [PosRoles.SuperAdmin, PosRoles.Admin].includes(
          req?.userInfo?.pos_role_id
        )
      ) {
        isSelfUpdate = false;
      }
      const { authCode, otp } = updateParams;
      if (isSelfUpdate) {
        await this.communicationService.verifyOtp(otp, authCode);
        updateParams.uuid = req.userInfo?.uuid;
        updateParams.currentUserMobile = req.userInfo?.mobile;
        updateParams.currentUserEmail = req.userInfo?.email;
      } else {
        const uuid = req.body?.uuid;
        if (!uuid) {
          throw new HttpException(
            `please provide uuid in request`,
            HttpStatus.BAD_REQUEST
          );
        }
        const userDetails = await this.apiPosService.fetchUserDetails(
          uuid,
          true
        );
        if (!userDetails) {
          throw new HttpException(
            `user details not found`,
            HttpStatus.BAD_REQUEST
          );
        }
        updateParams.uuid = uuid;
        updateParams.currentUserEmail = userDetails.email;
        updateParams.currentUserMobile = userDetails.mobile;
      }
      Logger.debug("User primary details ", {
        userDetails: updateParams,
      });
      const response = await this.userService.updateUserDetails(updateParams);
      return sendResponse(req, res, 200, "Success", response);
    } catch (error) {
      Logger.error("Error occurred while updating user details", { error });
      return sendResponse(
        req,
        res,
        error.status || 500,
        error?.message || "Internal Server Error",
        error?.response || error
      );
    }
  }

  @Post("/soft-delete-user")
  async softDeleteUser(@Req() req: Request, @Res() res: Response) {
    try {
      const userDetails: SoftDeleteUserDto = req.body;
      Logger.debug("userDetails ", { userDetails: userDetails });
      await this.userService.softDeleteUser(userDetails);
      return sendResponse(
        req,
        res,
        200,
        "ok",
        "cps iam soft delete succesfful."
      );
    } catch (error) {
      Logger.error("Error occurred while soft deleting iam and cps details", {
        error,
      });
      return sendResponse(
        req,
        res,
        500,
        "Internal Server Error",
        error?.response || error
      );
    }
  }

  @Get("/user-team-details-by-uuid/:uuid")
  @UserAuth(...PosInternalRoles)
  async getUserTeamDetailsByUuid(@Req() req: Request, @Res() res: Response) {
    try {
      const uuid = req?.params?.uuid;
      const response = await this.apiPosService.getUserTeamDetailsByUuid(uuid);
      return sendResponse(req, res, 200, "ok", response);
    } catch (error) {
      Logger.error("Error occurred while fetching user data using uuid", {
        error,
      });
      return sendResponse(
        req,
        res,
        500,
        "Internal Server Error",
        error?.response || error
      );
    }
  }
  @Post("/user/phone-book")
  @UserAuth()
  @ApiOperation({
    summary: "Update User Phone Book",
    requestBody: {
      description: "Save users phone book",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              fields: [
                {
                  mobile: "9999892189",
                  firstName: "Abhi",
                  lastName: "Ram",
                },
                {
                  mobile: "9999876189",
                  firstName: "Ravi",
                  lastName: "Raman",
                },
                {
                  mobile: "8976876189",
                  firstName: "Aakash",
                  lastName: "Singh",
                },
              ],
            },
          },
        },
      },
    },
  })
  async updateUserPhoneBook(@Req() req: ReqWithUser, @Res() res: Response) {
    Logger.debug("Updating Phone Book ", req.body);
    const requestBody = {
      contact: req.body?.contact,
      uuid: req.userInfo.uuid,
    };
    const response = await this.userPhoneBookService.updateUserPhoneBook(
      requestBody
    );
    return sendResponse(req, res, 200, "ok", response);
  }

  @Post("/user")
  @UserAuth(PosRoles.SuperAdmin, PosRoles.Admin)
  async updateUserBasicDetails(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Body() body: UpdateUserBasicDetailsDto
  ) {
    await this.userService.updateUserBasicDetails(body);
    return sendResponse(
      req,
      res,
      200,
      "User details updated successfully",
      null
    );
  }

  @Post("/user/search")
  @UserAuth(PosRoles.SuperAdmin, PosRoles.Admin)
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchUser(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Body() body: SearchUserRequestDto
  ) {
    const user = await this.userService.searchUser(body);
    return sendResponse(
      req,
      res,
      200,
      "User details fetched successfully",
      user
    );
  }

  @Get("user/details/:uuid")
  @UserAuth(PosRoles.SuperAdmin, PosRoles.Admin)
  async getUserDetails(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Param("uuid") uuid: string
  ) {
    const userDetails = await this.userService.fetchUserDetails(uuid);
    return sendResponse(
      req,
      res,
      200,
      "details fetched successfulyly",
      userDetails
    );
  }

  @Get("user/token")
  @UserAuth(PosRoles.Agent)
  async generateChatbotToken(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Query("type") type: string
  ) {
    const token = await this.tokenService.generateToken(type, req.userInfo);
    return sendResponse(req, res, 200, "token generated successfully", {
      token,
    });
  }
}

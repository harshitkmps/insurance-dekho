import { sendResponse } from "../../../services/helpers/response-handler";
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import { Request, Response } from "express";
import FraudService from "../services/fraud.service";
import { PosRoles } from "../../../constants/pos-roles.constants";
import {
  AttributeDto,
  UpdateAttributeRequestDto,
} from "../dtos/attributes-request";
import AttributeMapper from "../mapper/attribute.mapper";
import { UserAuth } from "@/src/decorators/user-auth.decorator";
import { ApiOperation } from "@nestjs/swagger";
import { ReqWithUser } from "@/src/interfaces/request/req-with-user.interface";
import { GetBlacklistUsersDto } from "../dtos/get-blacklist-users.dto";
import { GetBlacklistUserByIdQuery } from "../dtos/get-blacklist-user-by-id.dto";
import { UpdateFraudUserBody } from "../dtos/update-fraud-user.dto";
import { UpdateFraudUserByIdReq } from "../dtos/update-fraud-user-by-id.dto";
import { ENCRYPTED_ATTRIBUTES } from "@/src/constants/fraud.constants";
import EncryptionService from "@/src/services/encryption-service";

@Controller("/v1/fraud")
export class FraudController {
  constructor(
    private readonly fraudService: FraudService,
    private readonly encryptionService: EncryptionService
  ) {}

  @Get("/attributes/keys")
  @UserAuth(PosRoles.SuperAdmin)
  @ApiOperation({
    summary: "hit attribute-keys API of fraud service",
  })
  async getAttibuteKeys(@Req() req: Request, @Res() res: Response) {
    const data = await this.fraudService.prepareAttributeList();
    return sendResponse(req, res, 200, "ok", data);
  }

  @Post("/attributes/search")
  @UserAuth(PosRoles.SuperAdmin)
  @ApiOperation({
    summary: "Search blacklisted attributes",
    description: "Search blacklisted attributes",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              data: {
                key: "EMAIL",
                value: "blacklist@gmail.com",
                isEncrypted: false,
              },
            },
          },
        },
      },
    },
  })
  async searchAttributes(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any
  ) {
    const attribute: AttributeDto = body;
    const data = await this.fraudService.searchAttributes(attribute);
    return sendResponse(req, res, 200, "ok", data);
  }

  @Post("/attributes")
  @UserAuth(PosRoles.SuperAdmin)
  @ApiOperation({
    summary: "Update attributes",
    description: "Update attributes",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              data: {
                key: "EMAIL",
                value: "blacklist@gmail.com",
                isEncrypted: false,
                action: "block",
              },
            },
          },
        },
      },
    },
  })
  async updateAttributes(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any
  ) {
    const updateAttributeRequest: UpdateAttributeRequestDto = body;
    const attribute: AttributeDto = AttributeMapper.builder(
      updateAttributeRequest
    );
    let data = {};
    if (updateAttributeRequest.action === "block") {
      data = await this.fraudService.blockAttribute(attribute);
    } else if (updateAttributeRequest.action === "unblock") {
      data = await this.fraudService.unblockAttribute(attribute);
    }
    return sendResponse(req, res, 200, "ok", data);
  }

  @Get("/attributes/count")
  @UserAuth(PosRoles.SuperAdmin)
  @ApiOperation({
    summary: "Get each blacklisted attribute count",
  })
  async getAttributeCount(@Req() req: ReqWithUser, @Res() res: Response) {
    const result = await this.fraudService.getBlacklistedAttributeStats();
    return sendResponse(req, res, 200, "ok", result);
  }

  @Get("/users")
  @UserAuth(PosRoles.SuperAdmin)
  @ApiOperation({
    summary: "Get blacklisted users list",
  })
  async getBlacklistedUsers(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Query() query: GetBlacklistUsersDto
  ) {
    const result = await this.fraudService.getBlacklistedUserList(query);
    return sendResponse(req, res, 200, "ok", result);
  }

  @Get("/users/:id")
  @UserAuth(PosRoles.SuperAdmin)
  @ApiOperation({
    summary: "Get blacklisted user by id",
  })
  async getBlacklistedUserById(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Param("id") id: string,
    @Query() query: GetBlacklistUserByIdQuery
  ) {
    const result = await this.fraudService.getBlacklistedUserProfile(id, query);
    return sendResponse(req, res, 200, "ok", result);
  }

  @Post("/users")
  @UserAuth(PosRoles.SuperAdmin)
  @ApiOperation({
    summary: "Mark user as blocked/unblocked",
  })
  async updateUserStatus(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Body() body: UpdateFraudUserBody
  ) {
    const fraudReqBody = { ...body, uuid: req.userInfo.uuid };
    delete fraudReqBody.shouldEncrypt;
    if (
      body.shouldEncrypt &&
      ENCRYPTED_ATTRIBUTES.includes(body.blacklistAttributeKey)
    ) {
      const encryptRes = await this.encryptionService.encrypt([
        body.blacklistAttributeValue,
      ]);
      fraudReqBody.blacklistAttributeValue = encryptRes[0].ecrypted;
    }
    const result = await this.fraudService.updateUserFraudStatus(fraudReqBody);
    return sendResponse(req, res, 200, "ok", result);
  }

  @Patch("/users/:id")
  @UserAuth(PosRoles.SuperAdmin)
  @ApiOperation({
    summary: "Partial update of blacklisted user",
  })
  async updateUserById(
    @Req() req: ReqWithUser,
    @Res() res: Response,
    @Param("id") id: string,
    @Body() body: UpdateFraudUserByIdReq
  ) {
    const patchBody = { ...body, lastUpdatedBy: req.userInfo.uuid };
    const result = await this.fraudService.updateFraudUserById(id, patchBody);
    return sendResponse(req, res, 200, "ok", result);
  }
}

import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { sendResponse } from "../services/helpers/response-handler";
import {
  Controller,
  Get,
  Req,
  Res,
  HttpStatus,
  Query,
  UsePipes,
  ValidationPipe,
  UploadedFile,
  UnauthorizedException,
  UseInterceptors,
  Post,
  Body,
} from "@nestjs/common";
import { Response } from "express";
import { UserAuth } from "../decorators/user-auth.decorator";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import ContestService from "@/src/services/contests.service";
import { GetContestDto } from "@/src/dtos/contests/get-contests.dto";
import { GetLeaderboardDto } from "@/src/dtos/contests/get-leaderboard.dto";
import ContestsCreationService from "@/src/services/contests-creation.service";
import { Roles } from "@/src/constants/roles.constants";
import { FileInterceptor } from "@nestjs/platform-express";
import DocumentServiceV2 from "@/src/services/document-v2.service";
import ApiPosService from "@/src/services/apipos-service";
import { PosRoles } from "@/src/constants/pos-roles.constants";
import { CreateContestDto } from "@/src/dtos/contests/create-contests.dto";
import { ContestViews } from "@/src/constants/contests.constants";

@Controller("/v1/contests")
@ApiTags("Contests")
export class ContestsController {
  constructor(
    private contestService: ContestService,
    private contestsCreationService: ContestsCreationService,
    private documentService: DocumentServiceV2,
    private apiPosService: ApiPosService
  ) {}

  @ApiOperation({
    summary: "Get list of contests",
  })
  @UserAuth()
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getContests(
    @Req() request: ReqWithUser,
    @Res() response: Response,
    @Query() query: GetContestDto
  ) {
    const userInfo = request.userInfo;

    this.contestService.authenticateView(query, userInfo);
    const contests = await this.contestService.getContests(query, userInfo);

    return sendResponse(
      request,
      response,
      HttpStatus.OK,
      "list of contests successfully fetched",
      contests
    );
  }

  @ApiOperation({
    summary: "Get list of kurukshetra",
  })
  @UserAuth()
  @Get("/kurukshetra")
  @UsePipes(new ValidationPipe({ transform: true }))
  async getKurukshetraContests(
    @Req() request: ReqWithUser,
    @Res() response: Response,
    @Query() query: GetContestDto
  ) {
    const userInfo = request.userInfo;

    query.attributes = { campaign: "kurukshetra" };
    query.view =
      userInfo?.pos_role_id === 3
        ? ContestViews.CONTESTS_LIST
        : ContestViews.CONTEST_DETAIL;
    this.contestService.authenticateView(query, userInfo);
    const contestResponse = await this.contestService.getKurukshetraContest(
      query,
      userInfo
    );

    return sendResponse(
      request,
      response,
      HttpStatus.OK,
      "list of contests successfully fetched",
      contestResponse
    );
  }

  @ApiOperation({
    summary: "Get leaderboard of a contest",
  })
  @UserAuth()
  @Get("/leaderboard")
  @UsePipes(new ValidationPipe({ transform: true }))
  async getLeaderboard(
    @Req() request: ReqWithUser,
    @Res() response: Response,
    @Query() query: GetLeaderboardDto
  ) {
    const userInfo = request.userInfo;

    this.contestService.authenticateView(query, userInfo);
    const contests = await this.contestService.getLeaderboard(query, userInfo);
    return sendResponse(
      request,
      response,
      HttpStatus.OK,
      "list of contests successfully fetched",
      contests
    );
  }

  /*
  - separate api for tracking purposes
  */
  @ApiOperation({
    summary: "Get hierarchy leaderboard of a contest",
  })
  @UserAuth(...Roles.POS_SALES_ALL)
  @Get("/hierarchy/leaderboard")
  @UsePipes(new ValidationPipe({ transform: true }))
  async getHierarchyLeaderboard(
    @Req() request: ReqWithUser,
    @Res() response: Response,
    @Query() query: any
  ) {
    const userInfo = request.userInfo;

    const hierarchyIdentifiers =
      this.contestService.generateHierarchyIdentifiers(userInfo);
    const contests = await this.contestService.getLeaderboard(
      {
        ...query,
        hierarchyIdentifiers,
      },
      userInfo
    );
    return sendResponse(
      request,
      response,
      HttpStatus.OK,
      "list of contests successfully fetched",
      contests
    );
  }

  @ApiOperation({
    summary: "Get configs of a contest based upon view",
  })
  @UserAuth()
  @Get("/config")
  @UsePipes(new ValidationPipe({ transform: true }))
  async getContestConfig(
    @Req() request: ReqWithUser,
    @Res() response: Response,
    @Query() query: any
  ) {
    const userInfo = request.userInfo;

    this.contestService.authenticateView(query, userInfo);
    const config = await this.contestService.getContestsConfig(userInfo);
    return sendResponse(
      request,
      response,
      HttpStatus.OK,
      "list of contests successfully fetched",
      config
    );
  }

  @UserAuth(PosRoles.SuperAdmin)
  @Get("/creation/config")
  @UsePipes(new ValidationPipe({ transform: true }))
  async getContestCreationConfig(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const config = await this.contestsCreationService.getUIConfig();

    return sendResponse(
      request,
      response,
      HttpStatus.OK,
      "contest creation config fetched",
      config
    );
  }

  @Post("/uploads")
  @UseInterceptors(FileInterceptor("file"))
  async uploadDocument(
    @Req() request: any,
    @Res() response: Response,
    @UploadedFile() file: Express.Multer.File
  ) {
    const ott = request?.body?.ott;
    const authToken = await this.documentService.getTokenFromOtt(ott);
    if (!authToken) {
      throw new UnauthorizedException("auth token not found");
    }

    await this.contestsCreationService.authorizeFileUpload(authToken);
    const publicS3Url = await this.apiPosService.generatePublicS3Link(file);
    const data = {
      data: { doc_id: publicS3Url },
    };

    return sendResponse(
      request,
      response,
      HttpStatus.OK,
      "document uploaded successfully",
      data
    );
  }

  @UserAuth(PosRoles.SuperAdmin)
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createContest(
    @Req() request: ReqWithUser,
    @Res() response: Response,
    @Body() createContestBody: CreateContestDto
  ) {
    const data = await this.contestsCreationService.createContest(
      createContestBody
    );
    return sendResponse(
      request,
      response,
      HttpStatus.OK,
      "contest created successfully",
      data
    );
  }
}

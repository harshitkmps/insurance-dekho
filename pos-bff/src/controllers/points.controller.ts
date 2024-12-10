import { ApiOperation, ApiTags } from "@nestjs/swagger";
import PointsService from "@/src/services/helpers/points-service";
import { sendResponse } from "@/src/services/helpers/response-handler";
import {
  Get,
  Controller,
  Req,
  Res,
  Query,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { UserAuth } from "@/src/decorators/user-auth.decorator";
import { ReqWithUser } from "@/src/interfaces/request/req-with-user.interface";
import { Request, Response } from "express";
import {
  FetchPointsListDto,
  FetchPointsBreakUpDto,
  GetClubsDetailDto,
} from "@/src/dtos/request/points.dto";

@Controller()
@ApiTags("Points")
export class PointsController {
  constructor(private pointsService: PointsService) {}

  @Get("/v1/points")
  @ApiOperation({ summary: "Returns total points, breakup for a user" })
  async fetchPointsDetails(@Req() request: Request, @Res() response: Response) {
    return sendResponse(
      request,
      response,
      HttpStatus.BAD_REQUEST,
      "gcd_code not found",
      {}
    );
    // const gcdCode = request.query.userId;
    // if (!gcdCode) {
    //   return sendResponse(
    //     request,
    //     response,
    //     HttpStatus.BAD_REQUEST,
    //     "userId is required",
    //     {}
    //   );
    // }
    // Logger.debug(`request received for points ${gcdCode}`);
    // const responseData: any = await this.pointsService.getPointsBreakup({
    //   userId: gcdCode,
    // });
    // return sendResponse(
    //   request,
    //   response,
    //   HttpStatus.OK,
    //   "points details fetched successfully",
    //   responseData
    // );
  }

  @Get("/v2/points")
  @UserAuth()
  @ApiOperation({
    summary:
      "Returns total points, breakup for a user - strictly behind gateway",
  })
  async fetchPointsDetailsV2(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    return sendResponse(
      request,
      response,
      HttpStatus.BAD_REQUEST,
      "gcd_code not found",
      {}
    );
    // if (!request.userInfo?.gcd_code) {
    //   return sendResponse(
    //     request,
    //     response,
    //     HttpStatus.BAD_REQUEST,
    //     "gcd_code not found",
    //     {}
    //   );
    // }
    // const gcdCode = request.userInfo.gcd_code;
    // Logger.debug(`request received for points gcdCode: ${gcdCode}`);
    // const responseData: any = await this.pointsService.getPointsList(gcdCode);
    // return sendResponse(
    //   request,
    //   response,
    //   HttpStatus.OK,
    //   "points details fetched successfully",
    //   responseData
    // );
  }

  @Get("/v3/points")
  @UserAuth()
  @ApiOperation({
    summary: "Points Listing, strictly behind gateway",
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async fetchPointsList(
    @Req() request: ReqWithUser,
    @Query() query: FetchPointsListDto,
    @Res() response: Response
  ) {
    return sendResponse(
      request,
      response,
      HttpStatus.BAD_REQUEST,
      "gcd_code not found",
      {}
    );
    // try {
    //   if (!request.userInfo?.gcd_code) {
    //     return sendResponse(
    //       request,
    //       response,
    //       HttpStatus.BAD_REQUEST,
    //       "gcd_code not found",
    //       {}
    //     );
    //   }
    //   const gcdCode = request.userInfo?.gcd_code;
    //   query = {
    //     ...query,
    //     userId: gcdCode,
    //   };
    //   Logger.debug(`request received for points gcdCode: ${gcdCode}`);
    //   const responseData: any = await this.pointsService.getPointsList(query);
    //   return sendResponse(
    //     request,
    //     response,
    //     HttpStatus.OK,
    //     "points details fetched successfully",
    //     responseData
    //   );
    // } catch (error) {
    //   throw new HttpException(
    //     error.response || "Something went wrong",
    //     error.status || HttpStatus.INTERNAL_SERVER_ERROR
    //   );
    // }
  }

  @Get("/v3/points-breakup")
  @UserAuth()
  @ApiOperation({
    summary:
      "Returns total points, breakup for a user - strictly behind gateway",
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async fetchPointsBreakUp(
    @Req() request: ReqWithUser,
    @Query() query: FetchPointsBreakUpDto,
    @Res() response: Response
  ) {
    return sendResponse(
      request,
      response,
      HttpStatus.BAD_REQUEST,
      "gcd_code not found",
      {}
    );
    // try {
    //   if (!request.userInfo?.gcd_code) {
    //     return sendResponse(
    //       request,
    //       response,
    //       HttpStatus.BAD_REQUEST,
    //       "gcd_code not found",
    //       {}
    //     );
    //   }
    //   const gcdCode = request.userInfo?.gcd_code;
    //   query = {
    //     ...query,
    //     userId: gcdCode,
    //   };
    //   Logger.debug(`request received for points breakup gcdCode: ${gcdCode}`);

    //   const responseData: any = await this.pointsService.getPointsBreakup(
    //     query
    //   );
    //   Logger.debug(
    //     `Sending points breakup data for gcdCode: ${gcdCode}`,
    //     responseData
    //   );
    //   return sendResponse(
    //     request,
    //     response,
    //     HttpStatus.OK,
    //     "points breakup details fetched successfully",
    //     responseData
    //   );
    // } catch (error) {
    //   throw new HttpException(
    //     error.message || "Something went wrong",
    //     error.status || HttpStatus.INTERNAL_SERVER_ERROR
    //   );
    // }
  }

  @Get("/v1/club-details")
  @ApiOperation({
    summary:
      "Returns the detailed view of the various clubs present in the id-achiever",
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getClubsDetail(
    @Req() request: ReqWithUser,
    @Query() query: GetClubsDetailDto,
    @Res() response: Response
  ) {
    const responseData = await this.pointsService.getClubsDetail();

    return sendResponse(
      request,
      response,
      HttpStatus.OK,
      "clubs detail fetched successfully",
      responseData
    );
  }
}

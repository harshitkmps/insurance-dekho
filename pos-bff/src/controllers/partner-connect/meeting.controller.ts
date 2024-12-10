import { sendResponse } from "../../services/helpers/response-handler";
import {
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Req,
  Res,
  HttpStatus,
  Query,
} from "@nestjs/common";
import PartnerConnectService from "../../services/partner-connect-service";
import UtilityService from "../../services/utility-service";
import moment from "moment";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "@/src/decorators/user-auth.decorator";
import { ReqWithUser } from "@/src/interfaces/request/req-with-user.interface";
import { Response } from "express";
import { SalesRoles } from "@/src/constants/pos-roles.constants";
import { getSalesUserLoginDetailsDto } from "@/src/use-cases/fraud/dtos/partner-connect-sales-login.dto";
import { MeetingEvents } from "@/src/enums/meeting-events.enum";

@Controller("/v1/partner-connect")
@ApiTags("Partner Connect Meeting")
export class MeetingController {
  constructor(
    private partnerConnectService: PartnerConnectService,
    private utilityService: UtilityService
  ) {}

  @Post("/call-logs")
  @UserAuth()
  async addCallLog(@Req() request: ReqWithUser, @Res() response: Response) {
    const userInfo = request.userInfo;
    const requestBody = request.body;
    if (!requestBody.iamUuid) {
      requestBody.iamUuid = userInfo.uuid;
    }
    requestBody.employeeName = userInfo.first_name;
    requestBody.employeeId = userInfo.employee_id;
    Logger.debug("Adding Callog", requestBody);
    const responseBody = await this.partnerConnectService.addCallLog(
      requestBody
    );
    return sendResponse(
      request,
      response,
      200,
      "Calllog Added Successfully.",
      responseBody
    );
  }

  @Get("/call-logs")
  @UserAuth()
  async getCallLog(@Req() request: ReqWithUser, @Res() response: Response) {
    const userInfo = request.userInfo;
    if (!request.query.iam_uuid) {
      request.query.iamUuid = userInfo.uuid;
    } else {
      request.query.iamUuid = request.query.iam_uuid;
    }
    Logger.debug("Fetching Calllogs", request.query);
    const responseBody = await this.partnerConnectService.getCallLogs(
      request.query
    );
    return sendResponse(
      request,
      response,
      200,
      "Calllogs fectched Successfully.",
      responseBody
    );
  }

  @Post("/meetings")
  @UserAuth()
  async createMeeting(@Req() request: ReqWithUser, @Res() response: Response) {
    const userInfo = request.userInfo;
    const organiser = {
      idType: "iam_uuid",
      idValue: userInfo.uuid,
    };
    request.body.organiser = organiser;
    request.body.meetingContext.employeeName = userInfo.first_name;
    request.body.meetingContext.employeeId = userInfo.employee_id;
    Logger.debug("Creating Meeting", request.body);
    const responseBody = await this.partnerConnectService.createMeeting(
      request.body
    );
    return sendResponse(
      request,
      response,
      200,
      "Meeting created Successfully.",
      responseBody
    );
  }

  @Put("/meetings/:id")
  @UserAuth()
  async updateMeeting(
    @Req() request: ReqWithUser,
    @Res() response: Response,
    @Param("id") meetingId: string
  ) {
    const userInfo = request.userInfo;
    const organiser = {
      idType: "iam_uuid",
      idValue: userInfo.uuid,
    };
    request.body.organiser = organiser;
    Logger.debug("Updating", request.body);
    const responseBody = await this.partnerConnectService.updateMeeting(
      meetingId,
      request.body
    );
    return sendResponse(
      request,
      response,
      200,
      "Meeting updated Successfully.",
      responseBody
    );
  }

  @Get("/meetings")
  @UserAuth()
  async getMeetings(@Req() request: ReqWithUser, @Res() response: Response) {
    Logger.debug("Fetching Meeting Detail", request.body);
    const userInfo = request.userInfo;
    const requestBody = await this.partnerConnectService.getFilters(
      request.query
    );
    if (!requestBody.organiser) {
      const organiser = {
        idType: "iam_uuid",
        idValue: userInfo.uuid,
      };
      requestBody.organiser = organiser;
    }
    if (!requestBody.status && (requestBody.startDate || requestBody.endTime)) {
      requestBody.status = [
        MeetingEvents.CREATED,
        MeetingEvents.BLOCKED,
        MeetingEvents.RESCHEDULED,
        MeetingEvents.INPROCESS,
        MeetingEvents.COMPLETED,
      ];
    }
    const responseBody = await this.partnerConnectService.getMeetingDetail(
      requestBody
    );
    return sendResponse(
      request,
      response,
      200,
      "Meeting Fetched Successfully.",
      responseBody
    );
  }

  @Post("/download-report")
  @UserAuth()
  async downloadMeetings(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const userInfo = request.userInfo;
    Logger.debug("Creating Attendance", request.body);
    const apiParams: { organiser?: string; iam_uuid?: string; filters: any } = {
      filters: request.body.filters,
    };
    if (request.body.type == "meeting") {
      apiParams.organiser = userInfo.uuid;
    }
    if (request.body.type == "calls") {
      apiParams.iam_uuid = userInfo.uuid;
    }
    const headers = {
      authorization: request.headers.authorization,
    };
    const host = request.headers["x-hostname"];
    const medium =
      host === process.env.X_FORWAREDED_POS_APP_HOST
        ? process.env.APP_MEDIUM
        : process.env.POS_MEDIUM;
    const requestSource = medium;
    const type = request.body.type;
    const configName =
      type == "meeting" ? "partnerConnectMeetings" : "partnerConnectCalls";
    const endpoint = type == "meeting" ? "meeting" : "calls";
    const data = await this.utilityService.downloadData(
      configName,
      apiParams,
      headers,
      requestSource,
      userInfo.first_name,
      userInfo.email,
      userInfo.uuid,
      `vymo/report/${endpoint}`
    );
    const message = `${
      type == "meeting" ? "meetings" : "calls"
    } downloaded successfully`;
    const meta = {
      statusMessage: message,
      statusCode: 200,
      displayMessage: message,
    };
    return response.status(200).json({ ...data, meta });
  }

  @Post("/attendance")
  @UserAuth()
  async addPartnerAttendance(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const userInfo = request.userInfo;
    request.body.employeeName = userInfo.first_name;
    request.body.employeeId = userInfo.employee_id;
    request.body.uuid = userInfo.uuid;
    Logger.debug("Creating Attendance", request.body);
    const responseBody = await this.partnerConnectService.addPartnerAttendance(
      request.body
    );
    return sendResponse(
      request,
      response,
      200,
      "Attendance created Successfully.",
      responseBody.data.attendance
    );
  }

  @Get("/attendance/:date?")
  @UserAuth()
  async getAttendance(@Req() request: ReqWithUser, @Res() response: Response) {
    Logger.debug("Creating Attendance", request.body);
    const requestBody = {
      uuid: request.userInfo.uuid,
      date: request.params.date,
    };
    const responseBody = await this.partnerConnectService.getAttendance(
      requestBody
    );
    return sendResponse(
      request,
      response,
      200,
      "Attendance fetched Successfully.",
      responseBody
    );
  }

  @Get("/login-count")
  @UserAuth()
  async getLoginCount(@Req() request: ReqWithUser, @Res() response: Response) {
    const userInfo = request.userInfo;
    if (request.query["iam_uuid"]) {
      request.body.iam_uuid = request.query["iam_uuid"];
    } else {
      request.body.iam_uuid = userInfo.uuid;
    }
    let createdDateRange = {};
    if (request.query["startDate"] && request.query["endDate"]) {
      createdDateRange = {
        startDate: request.query["startDate"],
        endDate: request.query["endDate"],
      };
    } else {
      const now = moment().utcOffset("+05:30");
      const startDate = now.startOf("day").valueOf();
      const endDate = now.endOf("day").valueOf();
      createdDateRange = {
        startDate,
        endDate,
      };
    }
    const filters = {
      createdDateRange: createdDateRange,
    };
    request.body.filters = filters;
    const responseBody = await this.partnerConnectService.getLoginCount(
      request.body
    );
    return sendResponse(
      request,
      response,
      200,
      "Login count fetched.",
      responseBody
    );
  }

  @Get("/login/details")
  @UserAuth(...SalesRoles)
  @ApiOperation({
    summary: "Get details of logged in and non-logged in sales person",
    description: "Get details of logged in and non-logged in sales person",
  })
  async getSalesUserLoginDetails(
    @Req() request: ReqWithUser,
    @Res() response: Response,
    @Query() query: getSalesUserLoginDetailsDto
  ) {
    const params = query;
    Logger.debug("Getting user login details", params);
    try {
      const result =
        await this.partnerConnectService.getSalesUserActivityDetails(params);
      return sendResponse(
        request,
        response,
        HttpStatus.OK,
        "Login count fetched.",
        result
      );
    } catch (error) {
      Logger.error("Error fetching  User login details", error);
      return sendResponse(
        request,
        response,
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        error?.message ?? "Error fetching User login details",
        error
      );
    }
  }

  @Get("/my-team/activity")
  @UserAuth()
  async getActivityCount(
    @Req() request: ReqWithUser,
    @Res() response: Response
  ) {
    const userInfo = request.userInfo;
    if (request.query.iam_uuid) {
      request.body.iam_uuid = request.query.iam_uuid;
    } else {
      request.body.iam_uuid = userInfo.uuid;
    }
    request.body.team_uuid = request.query.team_uuid;
    let createdDateRange = {};
    if (request.query["startDate"] && request.query["endDate"]) {
      createdDateRange = {
        startDate: request.query["startDate"],
        endDate: request.query["endDate"],
      };
    } else {
      const startDate =
        moment().utcOffset("+05:30").startOf("day").unix() * 1000;
      const endDate = moment().utcOffset("+05:30").endOf("day").unix() * 1000;
      createdDateRange = {
        startDate,
        endDate,
      };
    }
    const filters = {
      createdDateRange: createdDateRange,
    };
    // console.log(filters);
    request.body.filters = filters;
    const responseBody = await this.partnerConnectService.getActivityCount(
      request.body
    );
    const myTeamActivity = await this.partnerConnectService.prepareData(
      responseBody
    );
    return sendResponse(
      request,
      response,
      200,
      "Activity count fetched.",
      myTeamActivity
    );
  }
}

import ContextHelper from "../services/helpers/context-helper";
import CommonApiHelper from "./helpers/common-api-helper";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import EncryptionService from "./encryption-service";
import DealerService from "./dealer-service";
import SalesService, { isUserInUpperHierarchy } from "./sales-service";
import moment from "moment";
import { MelorraScrapperService } from "./melorra-scrapper.service";
import { getSalesUserLoginDetailsDto } from "../use-cases/fraud/dtos/partner-connect-sales-login.dto";
import { MeetingEvents } from "../enums/meeting-events.enum";

@Injectable()
export default class PartnerConnectService {
  constructor(
    private commonApiHelper: CommonApiHelper,
    private encryptionService: EncryptionService,
    private salesService: SalesService,
    private melorraScrapperService: MelorraScrapperService
  ) {}

  private getHeaders(): any {
    if (ContextHelper?.getStore()?.get("authorization")) {
      return {
        authorization: ContextHelper.getStore().get("authorization"),
      };
    }
    return {};
  }

  public async addCallLog(body): Promise<any> {
    try {
      const options = {
        endpoint: `${process.env.FRAUD_SERVICE_ENDPOINT}/api/call-log`,
        config: {
          headers: this.getHeaders(),
        },
      };
      const response = await this.commonApiHelper.postData(options, body);
      return response;
    } catch (error) {
      Logger.error(`error while adding Calllog`, { error });
      throw new HttpException(
        error?.response?.message || error.message,
        error?.response?.httpCode ||
          error?.httpCode ||
          HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async getCallLogs(query): Promise<any> {
    try {
      const options = {
        endpoint: `${process.env.FRAUD_SERVICE_ENDPOINT}/api/call-log`,
        config: {
          headers: this.getHeaders(),
        },
      };
      const response = await this.commonApiHelper.fetchData(options, query);
      return response;
    } catch (error) {
      throw new HttpException(
        error?.response?.message || error.message,
        error?.response?.httpCode ||
          error?.httpCode ||
          HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async getSalesUserActivityDetails(
    params: getSalesUserLoginDetailsDto
  ): Promise<any> {
    const requestBody = this.prepareSalesLoginDetailsPayload(params);
    const salesUserLoginList: any =
      await this.melorraScrapperService.getSalesUserActivityList(requestBody);
    Logger.debug(
      "Getting login details response from central",
      salesUserLoginList
    );

    let decryptedTeamList = [];
    if (salesUserLoginList?.data && salesUserLoginList?.data?.length > 0) {
      decryptedTeamList = await this.prepareData(salesUserLoginList?.data);
    }

    return {
      data: decryptedTeamList,
      currentPageFirstRow: salesUserLoginList?.current_page_first_row,
      currentPageLastRow: salesUserLoginList?.current_page_last_row,
      hasNext: salesUserLoginList?.hasNext ?? false,
    };
  }

  public async createMeeting(body): Promise<any> {
    try {
      const options = {
        endpoint: `${process.env.FRAUD_SERVICE_ENDPOINT}/api/v1/calendar/events`,
        config: {
          headers: this.getHeaders(),
        },
      };
      const response = await this.commonApiHelper.postData(options, body);
      return response;
    } catch (error) {
      Logger.error(`error while creating meeting`, { error });
      throw new HttpException(
        error?.response?.message || error.message,
        error?.response?.httpCode ||
          error?.httpCode ||
          HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async getMeetingDetail(body): Promise<any> {
    try {
      const options = {
        endpoint: `${process.env.FRAUD_SERVICE_ENDPOINT}/api/v1/calendar/events/filters`,
        config: {
          headers: this.getHeaders(),
        },
      };
      const requestBody = body;
      const response = await this.commonApiHelper.postData(
        options,
        requestBody
      );
      return response;
    } catch (error) {
      throw new HttpException(
        error?.response?.message || error.message,
        error?.response?.httpCode ||
          error?.httpCode ||
          HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async updateMeeting(meetingId, body): Promise<any> {
    try {
      const options = {
        endpoint: `${process.env.FRAUD_SERVICE_ENDPOINT}/api/v1/calendar/events/${meetingId}`,
        config: {
          headers: this.getHeaders(),
        },
      };
      const requestBody = body;
      const response = await this.commonApiHelper.putData(options, requestBody);
      return response;
    } catch (error) {
      throw new HttpException(
        error?.response?.message || error.message,
        error?.response?.httpCode ||
          error?.httpCode ||
          HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async addPartnerAttendance(body): Promise<any> {
    try {
      const options = {
        endpoint: `${process.env.FRAUD_SERVICE_ENDPOINT}/api/attendance`,
        config: {
          headers: this.getHeaders(),
        },
      };
      const requestBody = body;
      const response = await this.commonApiHelper.postData(
        options,
        requestBody
      );
      return response;
    } catch (error) {
      throw new HttpException(
        error?.response?.message?.data || error.message.data,
        error?.response?.httpCode ||
          error?.httpCode ||
          HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async getAttendance(body): Promise<any> {
    try {
      const options = {
        endpoint: `${process.env.FRAUD_SERVICE_ENDPOINT}/api/attendance/check`,
        config: {
          headers: this.getHeaders(),
        },
      };
      const response = await this.commonApiHelper.postData(options, body);
      return response;
    } catch (error) {
      throw new HttpException(
        error?.response?.message || error.message.data,
        error?.response?.httpCode ||
          error?.httpCode ||
          HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async addVisitor(body): Promise<any> {
    try {
      const options = {
        endpoint: `${process.env.LOS_ENDPOINT}/api/v1/visitors`,
        config: {
          headers: this.getHeaders(),
        },
      };
      const response = await this.commonApiHelper.postData(options, body);
      return response;
    } catch (error) {
      throw new HttpException(
        error?.message?.message,
        error?.response?.httpCode ||
          error?.httpCode ||
          HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async getVisitorsWithFilter(filters): Promise<any> {
    try {
      if (!filters?.isloginUserFetchData) {
        const sfaHierarchyRequest = {
          uuid: filters?.salesUserIamId,
          getSalesMapping: true,
        };
        const sfaUserHeirarchyData = await this.salesService.getSfaUsers(
          sfaHierarchyRequest
        );
        const userFound = await isUserInUpperHierarchy(
          sfaUserHeirarchyData,
          filters?.assignedSalesIamUuid
        );
        if (userFound) {
          throw new HttpException("Invalid User uuid", HttpStatus.BAD_REQUEST);
        }
      }
      const options = {
        endpoint: `${process.env.LOS_ENDPOINT}/api/v1/visitors`,
        config: {
          headers: this.getHeaders(),
        },
      };
      const response = await this.commonApiHelper.fetchData(options, filters);
      return response;
    } catch (error) {
      throw new HttpException(
        error?.response?.message || error.message.data || error?.message,
        error?.response?.httpCode ||
          error?.httpCode ||
          HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async getVisitor(id): Promise<any> {
    Logger.debug("Fetching visitor detail with id: ", id);
    try {
      const options = {
        // endpoint: `${process.env.LOS_ENDPOINT}/api/v1/visitors/${id}`,
        endpoint: `http://poscorebestaging.insurancedekho.com/api/v1/visitors/${id}`,
        method: "GET",
        config: {
          headers: this.getHeaders(),
        },
      };
      const response = await this.commonApiHelper.getData(options, {});
      return response;
    } catch (error) {
      Logger.error(error);
      throw new HttpException(
        error?.response?.message || error.message.data,
        error?.response?.httpCode ||
          error?.httpCode ||
          HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  public async updateVisitor(id, body): Promise<any> {
    try {
      const options = {
        endpoint: `${process.env.LOS_ENDPOINT}/api/v1/visitors/${id}`,
        config: {
          headers: this.getHeaders(),
        },
      };
      await this.commonApiHelper.putData(options, body);
    } catch (error) {
      throw new HttpException(
        error?.response?.message || error.message.data,
        error?.response?.httpCode ||
          error?.httpCode ||
          HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async getLoginCount(body): Promise<any> {
    try {
      const options = {
        endpoint: `${process.env.API_CENTRAL_URL}/vymo/count/login`,
        config: {
          headers: this.getHeaders(),
        },
      };
      const response = await this.commonApiHelper.postData(options, body);
      return response.data;
    } catch (error) {
      throw new HttpException(
        error?.response?.message || error.message.data,
        error?.response?.httpCode ||
          error?.httpCode ||
          HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async getActivityCount(body): Promise<any> {
    try {
      const options = {
        endpoint: `${process.env.API_CENTRAL_URL}/vymo/my_team/activity`,
        config: {
          headers: this.getHeaders(),
        },
      };
      const response = await this.commonApiHelper.postData(options, body);
      return response.data;
    } catch (error) {
      throw new HttpException(
        error?.response?.message || error.message.data,
        error?.response?.httpCode ||
          error?.httpCode ||
          HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async getFilters(query: any) {
    const filters: any = {};
    if (query["meetingId"]) {
      filters._id = query["meetingId"];
    }
    if (query["organiserIdType"] && query["organiserIdValue"]) {
      const organiser = {
        idType: query["organiserIdType"],
        idValue: query["organiserIdValue"],
      };
      filters.organiser = organiser;
    }
    if (query["type"]) {
      filters.type = query["type"];
    }
    if (query["startDateTime"]) {
      filters.startTime = parseInt(query["startDateTime"]);
    }
    if (query["endDateTime"]) {
      filters.endTime = parseInt(query["endDateTime"]);
    }
    if (query["status"]) {
      const validStatuses = new Set<string>(Object.values(MeetingEvents));
      const statusArr: MeetingEvents[] = query.status
        .split(",")
        .filter((status: string) => validStatuses.has(status));
      filters.status = statusArr;
    }
    if (query["pageSize"]) {
      filters.pageSize = parseInt(query["pageSize"]);
    }
    if (query["nextPageId"] && query["nextPageStartDate"]) {
      filters.nextCursor = {
        _id: query["nextPageId"],
        cursorDate: query["nextPageStartDate"],
      };
    }
    if (query.showLatestOnTop === "true") {
      filters.showLatestOnTop = true;
    }
    return filters;
  }

  public prepareSalesLoginDetailsPayload(params: any) {
    const startDate =
      params?.startDate ||
      moment().utcOffset("+05:30").startOf("day").valueOf().toString();
    const endDate =
      params?.endDate ||
      moment().utcOffset("+05:30").endOf("day").valueOf().toString();
    const filters = {
      includeAllSubReportees:
        params?.includeAllSubReportees === "false" ? false : true,
      createdDateRange: {
        startDate,
        endDate,
      },
      searchName: null,
      nonLoggedInUserDetails: params?.nonloggedInUser === "true",
    };
    if (params?.searchName) {
      filters.searchName = params.searchName.toString();
    }
    const requestBody = {
      iam_uuid: params?.iamUuid,
      team_uuid: params?.teamUuid,
      filters,
      nextCursor: null,
      previousCursor: null,
      limit: 12,
    };
    if (params?.currentPageLastRow) {
      requestBody.nextCursor = Number(params.currentPageLastRow);
    }
    if (params?.currentPageFirstRow) {
      requestBody.previousCursor = Number(params.currentPageFirstRow);
    }
    return requestBody;
  }

  public async prepareData(teamList) {
    const encryptedData = [];
    teamList.forEach((element) => {
      if (element.mobile) {
        encryptedData.push(element.mobile);
      }
      if (element.email) {
        encryptedData.push(element.email);
      }
    });

    const decryptedData = await this.encryptionService.decrypt(encryptedData);
    teamList.forEach((element) => {
      if (element.mobile) {
        element.mobile = parseInt(
          decryptedData?.data[element.mobile]?.decrypted
        );
      }
      if (element.email) {
        element.email = decryptedData?.data[element.email]?.decrypted;
      }
    });

    return teamList;
  }
}

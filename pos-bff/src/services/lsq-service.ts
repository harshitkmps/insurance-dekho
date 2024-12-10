import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import { sendResponse } from "./helpers/response-handler";
import LeadOnboardingService from "./leadonboarding-service";
import { AxiosResponse } from "axios";

@Injectable()
export default class LsqService {
  constructor(
    private apiHelper: CommonApiHelper,
    private leadOnboardingService: LeadOnboardingService
  ) {}

  public async getChannelPartnerDetails(uuid): Promise<any> {
    Logger.debug(`fetching channel partner details for uuid ${uuid}`);
    const options = {
      endpoint: process.env.CHANNEL_PARTNER_SERVICE_ENDPOINT_V2,
      method: "GET",
    };
    const query = {
      getAgentMapping: true,
      iam_uuid: uuid,
    };
    const cpsResponseData: any = await this.apiHelper.getData(options, query);
    return cpsResponseData.data;
  }

  public async getSalesPartnerDetails(params: any): Promise<any> {
    Logger.debug(`fetching sales profile details for uuid ${params}`);
    try {
      const options = {
        endpoint: process.env.SFA_USERS_DATA_ENDPOINT,
      };
      const query = {
        projection:
          "id,employee_id,name,designation_id,masked_email,iam_uuid,email,mobile,uuid",
        getSalesMapping: true,
        ...params,
      };
      const response: AxiosResponse<any> = await this.apiHelper.fetchData(
        options,
        query
      );
      return response.data;
    } catch (error) {
      if (error?.status === HttpStatus.NOT_FOUND) {
        return { data: [] };
      }
      throw new HttpException(
        "Some error has occurred while fetching sfa details",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  public async assignUser(request: any, response: any): Promise<any> {
    Logger.debug("assigning sales user for request ", request.body);
    try {
      const data = request.body;
      const body = {
        assignedSalesIamUuid: data.mx_Assigned_LEAD_RM_UUID,
        leadId: data.mx_UUID,
      };
      const leadUpdateResponse = await this.leadOnboardingService.updateLead(
        data.mx_UUID,
        body
      );
      return leadUpdateResponse;
    } catch (error) {
      throw new HttpException(
        "Some error has occurred while posting the data.",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }
  public async handOverUser(request: any, response: any): Promise<any> {
    try {
      const headers = {
        "Content-Type": "application/json",
        "x-api-key": request.headers["x-api-key"],
      };
      const data = request.body;
      Logger.debug("handover user ", data);
      if (data && data.mx_UUID) {
        const options = {
          endpoint:
            process.env.CHANNEL_PARTNER_SERVICE_ENDPOINT_V2 +
            "/MapPartnersByMobile",
          headers: headers,
        };
        const data = {
          iam_uuid: request.body.mx_UUID,
        };
        const resp = await this.apiHelper.postData(options, data);
        Logger.debug(`response for handover for user ${data.iam_uuid}`, resp);
        if (resp && resp.meta && resp.meta.code == 200) {
          const response = {
            mx_Assigned_RM_Email: resp.data.email,
            mx_Assigned_RM_Mobile: resp.data.mobile,
            mx_Assigned_RM_Name: resp.data.name,
            message: "lead handover done successfully",
          };
          return response;
        } else {
          return sendResponse(
            request,
            response,
            503,
            "rm details hasn't been fetched successfully",
            data
          );
        }
      }
    } catch (error) {
      const msg = {
        status: 404,
        message: "rm details hasn't been fetched successfully here",
      };
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
  }
  public async rmHandOver(request: any, response: any): Promise<any> {
    try {
      const headers = {
        "Content-Type": "application/json",
        "x-api-key": request.headers["x-api-key"],
      };
      const data = request.body;
      if (data && data.mx_UUID) {
        const cpsResp = await this.getChannelPartnerDetails(data.mx_UUID);
        const cpsId = cpsResp?.[0]?.cps_id;
        if (cpsId) {
          const salesPartnerDetails = await this.getSalesPartnerDetails({
            iam_uuid: data.mx_Assigned_AGENT_RM_UUID,
          });
          const salesPartnerMobile = salesPartnerDetails?.data[0]?.mobile;
          if (salesPartnerMobile) {
            const options = {
              endpoint:
                process.env.CHANNEL_PARTNER_SERVICE_ENDPOINT_V2 + `/${cpsId}`,
              headers: headers,
            };
            const cpsData = {
              rm_mobile: salesPartnerMobile,
            };
            Logger.debug("CPS options", options);
            Logger.debug("CPS Data", cpsData);
            const resp = await this.apiHelper.putData(options, cpsData);
            return resp;
          } else {
            return sendResponse(
              request,
              response,
              503,
              "rm details doesn't exist in our system.",
              ""
            );
          }
        } else {
          return sendResponse(request, response, 503, "cps id not found", "");
        }
      }
    } catch (error) {
      const msg = {
        status: 404,
        message: "some error has occurred",
      };
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
  }
}

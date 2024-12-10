import { Injectable, Logger } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import LOSService from "./los-service";
import CpsService from "./cps-service";
import { UpdateUserBody } from "../dtos/request/user-request.dto";

@Injectable()
export default class IamService {
  constructor(
    private apiHelper: CommonApiHelper,
    private losService: LOSService,
    private cpsService: CpsService
  ) {}

  public async iamSoftDelete(uuid: any, userDetails: any): Promise<any> {
    try {
      const headers = {
        "Content-Type": "application/json",
        "x-api-key": process.env.IAM_X_API_KEY,
        "x-correlation-id": "pos" + Math.round(Date.now()),
        "X-HOSTNAME": process.env.IAM_API_HOST,
      };
      const options = {
        endpoint: process.env.IAM_ENDPOINT + `/api/v1/user/accounts/${uuid}`,
        config: {
          headers: headers,
        },
      };
      const reqBody = {
        mobile: userDetails.mobile,
        isDeleted: 1,
        tenant_id: userDetails.tenantId,
      };
      const response = await this.apiHelper.postData(options, reqBody);
      Logger.debug("iamsoftDeletionResponse ", {
        response: response,
      });
      return response;
    } catch (error) {
      Logger.error("error while soft deleting Iam Details", { error });
      return [];
    }
  }

  public async updateIamUserDetails(data: any): Promise<any> {
    let response = {};
    const iamData = await this.prepareIamData(data);
    const uuid = data?.uuid;
    Logger.debug("iamData ", {
      iamData: iamData,
    });
    response = await this.iamUserUpdate(iamData, uuid);
    return response;
  }

  public async triggerEventAndIamSoftDelete(
    leadResp: any,
    userDetails: any
  ): Promise<any> {
    const leadData = leadResp?.data?.data;
    for (const item of leadData) {
      const body = {
        leadId: item.uuid,
        leadTrigger: "CLOSE",
        data: {
          remarkId: 14,
        },
      };

      const uuid = item?.uuid;
      if (item.leadState !== "registered") {
        try {
          await this.losService.triggerEvent(body);
        } catch (error) {
          Logger.error("Error occurred in triggerEvent()", {
            error,
          });
        }
        if (uuid !== userDetails?.uuid) {
          try {
            await this.iamSoftDelete(uuid, userDetails);
          } catch (error) {
            Logger.error("Error occurred in iamSoftDelete()", {
              error,
            });
          }
        }
      }
    }
  }

  public async iamUserSoftDeleteIfExistInCPS(userDetails: any): Promise<any> {
    const iamUuid = await this.getIamUserUuid(userDetails.mobile);
    Logger.log("iamUuid ", {
      iamUuid: iamUuid,
    });
    if (iamUuid) {
      const isUserExistInCpsOrSfa =
        await this.cpsService.isUserDetailsExistInCpsOrSfa(iamUuid);
      if (!isUserExistInCpsOrSfa) {
        try {
          if (iamUuid !== userDetails?.uuid) {
            await this.iamSoftDelete(iamUuid, userDetails);
          }
        } catch (error) {
          Logger.error("Error occurred in iamSoftDelete", { error });
        }
      }
      Logger.log("isUserExistInCpsOrSfa ", {
        isUserExistInCpsOrSfa: isUserExistInCpsOrSfa,
      });
    }
  }

  private async prepareIamData(data: any): Promise<any> {
    const iamData: any = {};
    iamData.source = data.source;
    iamData.sub_source = "POS";
    let name = "";
    if (data.last_name) {
      name = data.first_name + " " + data.last_name;
    } else {
      name = data.first_name;
    }
    iamData.name = name;
    iamData.email = data.email;
    iamData.mobile = data.mobile;
    iamData.status = 1;
    iamData.tenant_id = data.tenantId;
    return iamData;
  }

  public async iamUserUpdate(data: any, uuid: any): Promise<any> {
    try {
      const response: any = {};
      const headers = {
        "Content-Type": "application/json",
        "x-api-key": process.env.IAM_X_API_KEY,
        "x-correlation-id": "pos" + Math.round(Date.now()),
        "X-HOSTNAME": process.env.IAM_API_HOST,
      };
      const options = {
        endpoint: process.env.IAM_ENDPOINT + `/api/v1/user/accounts/${uuid}`,
        method: "POST",
        config: {
          headers: headers,
        },
      };
      Logger.debug("datapostng ", {
        options: options,
        data: data,
        uuid: uuid,
      });
      const iamResponse = await this.apiHelper.postData(options, data);
      Logger.debug("iamResponse ", {
        iamResponse: iamResponse,
      });
      if (iamResponse.status == "T") {
        response.status = true;
        response.message = iamResponse?.message;
        response.response_http_code = "200";
      } else {
        response.status = false;
        response.message = iamResponse?.message;
        response.response_http_code = "400";
      }
      return response;
    } catch (error) {
      Logger.error("error while updating Iam Details", { error });
      return [];
    }
  }
  public async getIamUserUuid(mobile: any): Promise<any> {
    try {
      const headers = {
        "Content-Type": "application/json",
        "x-api-key": process.env.IAM_X_API_KEY,
        "x-correlation-id": "pos" + Math.round(Date.now()),
        "X-HOSTNAME": process.env.IAM_API_HOST,
      };
      const options = {
        endpoint:
          process.env.IAM_ENDPOINT + `/api/v1/user/accounts/uuid/${mobile}`,
        method: "GET",
        config: {
          headers: headers,
        },
      };
      const iamResp: any = await this.apiHelper.getData(options, {});
      return iamResp?.data?.uuid;
    } catch (error) {
      Logger.error("error while fetching Iam Details", { error });
      return [];
    }
  }

  public async getDetailsByUuid(uuid: string, params: any): Promise<any> {
    const options = {
      endpoint: `${process.env.IAM_ENDPOINT}/api/v1/user/accounts/${uuid}`,
      config: {
        headers: {
          "X-HOSTNAME": process.env.X_FORWAREDED_POS_HOST,
          "x-api-key": process.env.IAM_X_API_KEY,
        },
      },
    };
    Logger.debug("get iam details by uuid API params ", { options, params });
    const response: any = await this.apiHelper.fetchData(options, params);
    Logger.debug("received reponse for iam details by uuid list");
    return response.data;
  }

  public async getDetailsByEmail(params: UpdateUserBody): Promise<any> {
    const options = {
      endpoint: `${process.env.IAM_ENDPOINT}/api/v1/user/accounts/uuid`,
      config: {
        headers: {
          "X-HOSTNAME": process.env.X_FORWAREDED_POS_HOST,
          "x-api-key": process.env.IAM_X_API_KEY,
        },
      },
    };
    Logger.debug("get iam details by uuid API params ", { options, params });
    try {
      const response: any = await this.apiHelper.fetchData(options, params);
      Logger.debug("Received response for IAM details by UUID");
      return response?.data?.uuid ?? null;
    } catch (error) {
      Logger.error("Error occurred while fetching IAM details by UUID", {
        error,
      });
      throw new Error("Failed to fetch IAM details by email.");
    }
  }
}

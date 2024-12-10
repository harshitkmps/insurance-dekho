import { ConfigService } from "@nestjs/config";
import CommonApiHelper from "./helpers/common-api-helper";
import ContextHelper from "./helpers/context-helper";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { AxiosResponse } from "axios";
import { SearchUserRes } from "../interfaces/api-pos/search-user.interface";
import { UseCache } from "../decorators/use-cache.decorator";
import FormData from "form-data";
import { SaveEStampBody } from "../interfaces/api-pos/upload-estamp.interface";
import { GetEStampsQuery } from "../interfaces/api-pos/get-estamps.interface";
import { GetUserDocsQuery } from "../interfaces/api-pos/get-user-docs.interface";
import { GetKycDocQuery } from "../interfaces/api-pos/get-kyc-docs.interface";
import {
  GetPolicyBookRatio,
  PolicyBookRatioRes,
} from "../interfaces/api-pos/get-policy-book-ratio.interface";

const getHeaders = () => {
  return {
    authorization: ContextHelper.getStore().get("authorization"),
    "x-correlation-id": ContextHelper.getStore().get("x-correlation-id"),
  };
};
@Injectable()
export default class ApiPosService {
  constructor(
    private readonly commonApiHelper: CommonApiHelper,
    private readonly configService: ConfigService
  ) {}

  public async fetchQuestions(insuranceType): Promise<any> {
    Logger.debug(`fetching questions for insuranceType ${insuranceType}`);
    const apiPosEndpoint = this.configService.get("API_POS_ENDPOINT");
    const options = {
      endpoint: `${apiPosEndpoint}/v1/onboard/questionset?insurance_type=${insuranceType}`,
    };
    const response: any = await this.commonApiHelper.fetchData(options, {});
    return response.data;
  }

  public async clearLeadTest(body): Promise<any> {
    Logger.debug("test attempt api call to api-pos: ", body);
    const options = {
      endpoint: `${this.configService.get("API_POS_ENDPOINT")}/v1/test/clear`,
    };
    const response: any = await this.commonApiHelper.postData(options, body);
    return response.data;
  }

  public async evaluateAndSubmitTestSubmission(body): Promise<any> {
    Logger.debug("test submit api", body);
    const apiPosEndpoint = this.configService.get("API_POS_ENDPOINT");
    const options = {
      endpoint: `${apiPosEndpoint}/v2/test/evaluation`,
    };
    const response: any = await this.commonApiHelper.postData(options, body);
    return response.data;
  }

  public async fetchTestScore(leadId, insuranceType): Promise<any> {
    Logger.debug(
      `fetching test score for leadId ${leadId} and insuranceType ${insuranceType}`
    );
    const apiPosEndpoint = this.configService.get("API_POS_ENDPOINT");
    const options = {
      endpoint: `${apiPosEndpoint}/v2/test/score?leadId=${leadId}&insuranceType=${insuranceType}`,
    };
    const response: any = await this.commonApiHelper.fetchData(options, {});
    return response.data;
  }

  public async fetchUserDetails(
    uuid = null,
    checkActive = true,
    mobile = null,
    email = null
  ): Promise<any> {
    try {
      Logger.debug(`fetching user details for iamUUID ${uuid}`);
      const options = {
        endpoint: `${this.configService.get("API_POS_ENDPOINT")}/v1/user-info`,
        config: {
          headers: {
            ...getHeaders(),
            "x-api-key": process.env.API_POS_X_API_KEY,
          },
        },
      };
      const params: any = {
        checkActive,
        getConfig: true,
        ...(uuid && { uuid }),
        ...(email && { email }),
        ...(mobile && { mobile }),
      };
      const response: any = await this.commonApiHelper.fetchData(
        options,
        params
      );
      return response.data?.user_basic_info;
    } catch (error) {
      Logger.error(`error in fetching user details ${JSON.stringify(error)}`);
      return;
    }
  }

  public async fetchUserToAssign(cityId, tenantId): Promise<any> {
    Logger.debug(`fetching user for cityId ${cityId} and tenantId ${tenantId}`);
    const apiPosEndpoint = this.configService.get("API_POS_ENDPOINT");
    const options = {
      endpoint: `${apiPosEndpoint}/v1/assignsales?cityId=${cityId}&tenantId=${tenantId}`,
      config: {
        headers: getHeaders(),
      },
    };
    const response: any = await this.commonApiHelper.fetchData(options, {});
    return response?.data?.uuid;
  }

  public async fetchQrCode(gcdCode: string) {
    try {
      Logger.debug(`fetching qr code with following gcd code ${gcdCode}`);
      const apiPosEndpoint = this.configService.get("API_POS_ENDPOINT");
      const options = {
        endpoint: `${apiPosEndpoint}/v1/agentProfile`,
      };
      const body = {
        gcdCode: gcdCode,
      };
      const response = await this.commonApiHelper.postData(options, body);
      if (response?.status !== 200) {
        throw response;
      }
      return response?.data;
    } catch (error) {
      Logger.error("Error while fetching qr code", error);
      throw new HttpException(
        "Error while fetching qr code",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async guestLogin(
    name: string,
    mobile: string,
    profileId: string,
    productSelected: string
  ) {
    try {
      Logger.debug(
        `guest login with following params name: ${name} mobile: ${mobile} profileId: ${profileId}`
      );
      const options = {
        endpoint: `${this.configService.get("API_POS_ENDPOINT")}/v1/guests`,
        config: {
          isResHeadersRequired: true,
        },
      };
      const body = {
        name,
        mobile,
        profileId,
        productSelected,
      };
      const response = await this.commonApiHelper.postData(options, body);
      if (!!!response.headers) {
        throw response.headers;
      }
      return response.headers;
    } catch (error) {
      const displayError = error?.response?.message?.errors ??
        error?.message?.errors ?? {
          displayMessage: "Error in guest login",
        };
      Logger.error(
        "Error in guest login",
        error?.response?.message ?? error?.message ?? "Error in guest login"
      );
      throw new HttpException(displayError, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async checkCallingAbility(params: any, config: any): Promise<any> {
    Logger.debug("checkCallingAbility api hit params", { config, params });
    const options = {
      endpoint:
        this.configService.get("API_POS_ENDPOINT") + `/v1/checkCallingAbility`,
      timeout: 5000,
      config,
    };

    const response: any = await this.commonApiHelper.fetchData(options, params);
    return response.data;
  }

  public async checkLoginSupportAuth(params: Object): Promise<any> {
    const options = {
      endpoint:
        this.configService.get("API_POS_ENDPOINT") + `/v1/loginSupportAuth`,
      config: {
        headers: getHeaders(),
      },
    };

    const response: any = await this.commonApiHelper.postData(options, params);
    return response.data;
  }

  public async updateTblConfig(params: object): Promise<any> {
    const options = {
      endpoint:
        this.configService.get("API_POS_ENDPOINT") + `/v1/config/update`,
    };
    Logger.debug("update tbl config API params", { params });

    const response: any = await this.commonApiHelper.postData(options, params);
    return response.data;
  }

  public async getPartnerDetails(params: any, config: any): Promise<any> {
    Logger.debug("getParnerDetails api hit params", { config, params });
    const options = {
      endpoint:
        this.configService.get("API_POS_ENDPOINT") + `/v1/fetchPartnerProfile`,
      timeout: 5000,
      config,
    };

    const response: any = await this.commonApiHelper.fetchData(options, params);
    Logger.debug("getPartnerDetails API response", response);
    return response.data;
  }

  public async sendCommunication(reqBody: any, authHeader: any): Promise<any> {
    try {
      const endpoint =
        this.configService.get("API_POS_ENDPOINT") + "/v1/communications";

      const headers = {
        Authorization: authHeader,
      };

      const options = {
        endpoint: endpoint,
        method: "POST",
        config: {
          headers: headers,
        },
      };
      const response = await this.commonApiHelper.postData(options, reqBody);

      if (!response.error) {
        Logger.debug(`Upload life Doc's communication sent successfully`);
        return response;
      } else {
        throw "Error in sending Upload life Doc's communication";
      }
    } catch (e) {
      Logger.error("Error in sending communication");
      throw e;
    }
  }

  public async updateAgentBankDetails(userDetails: Object): Promise<any> {
    try {
      const endpoint =
        this.configService.get("API_POS_ENDPOINT") +
        "/v1/update-agent-details/bank";

      Logger.debug(
        "updation of agent Bank Details in POS-API: " +
          JSON.stringify(userDetails)
      );

      const options = {
        endpoint: endpoint,
        method: "POST",
        config: {
          headers: getHeaders(),
        },
      };
      const response = await this.commonApiHelper.postData(
        options,
        userDetails
      );
      Logger.debug(`agent bank details in POS-API updated successfully`);
      return response;
    } catch (e) {
      Logger.error("Error while updating agent bank details in POS-API");
      throw e;
    }
  }

  public async createSubUser(userDetails: Object): Promise<any> {
    try {
      const endpoint =
        this.configService.get("API_POS_ENDPOINT") + "/v1/sub-user";

      Logger.debug(
        "creation of Sub-User in POS-API: " + JSON.stringify(userDetails)
      );

      const options = {
        endpoint: endpoint,
        method: "POST",
      };
      const response = await this.commonApiHelper.postData(
        options,
        userDetails
      );
      Logger.debug(`Sub-user is created in POS-API successfully`);
      return response;
    } catch (e) {
      throw e;
    }
  }
  public async shareProposal(params: any): Promise<any> {
    Logger.debug("share content api pos req body", { body: params });
    const options = {
      endpoint:
        this.configService.get("API_POS_ENDPOINT") + "/v1/share-content",
    };
    const response: any = await this.commonApiHelper.fetchData(options, params);
    return response.data;
  }

  public async fetchPartnerConfig(params: any, config: any): Promise<any> {
    Logger.debug("fetchPartnerConfig api hit params", { config, params });
    const options = {
      endpoint:
        this.configService.get("API_POS_ENDPOINT") + `/v1/partner-config`,
      timeout: 5000,
      config,
    };

    const response: any = await this.commonApiHelper.fetchData(options, params);
    return response.data;
  }

  public async updateUserDetails(uuid, body, errorResponseMap = null) {
    const params = { ...body, isUuidPresent: true };
    const endpoint =
      this.configService.get("API_POS_ENDPOINT") + "/v1/update-user/" + uuid;
    const options: any = {
      endpoint: endpoint,
      method: "POST",
      config: {
        headers: getHeaders(),
      },
    };
    if (errorResponseMap) {
      options.config.errorResponseMap = errorResponseMap;
    }
    const response = await this.commonApiHelper.postData(options, params);
    return response;
  }

  public async getUserTeamDetailsByUuid(uuid: string) {
    const endpoint =
      this.configService.get("API_POS_ENDPOINT") +
      "/v1/team-details?uuid=" +
      uuid;
    const options = {
      endpoint: endpoint,
      method: "GET",
    };
    const response: any = await this.commonApiHelper.getData(options, {});
    const teamDetails = {};
    if (response?.data?.user_basic_info) {
      teamDetails["team_rm_mapping"] =
        response?.data?.user_basic_info?.team_rm_mapping;
      teamDetails["teams"] = response?.data?.user_basic_info?.teams;
    }
    return teamDetails;
  }

  public async getCityIdByPincode(pincode) {
    try {
      const endpoint =
        this.configService.get("API_POS_ENDPOINT") + "/v1/pincode/" + pincode;
      const options = {
        endpoint: endpoint,
        method: "GET",
      };
      const response: any = await this.commonApiHelper.getData(options, {});
      return response?.data?.[0]?.cityId;
    } catch (error) {
      Logger.error(`some error occured to get cityId using pincode ${error}`);
      return null;
    }
  }

  public async searchUser(params: any): Promise<SearchUserRes> {
    const options = {
      endpoint: this.configService.get("API_POS_ENDPOINT") + "/v1/user/search",
    };

    const response: AxiosResponse<SearchUserRes> =
      await this.commonApiHelper.fetchData(options, params);

    return response.data;
  }

  @UseCache({ expiryTimer: 60 * 60, useObjectAsKey: true })
  public async isInternalUserMapped(params: any): Promise<boolean> {
    try {
      const apiPosEndpoint = this.configService.get("API_POS_ENDPOINT");
      const options = {
        endpoint: apiPosEndpoint + "/v1/dialer/eligibility",
      };
      const response: any = await this.commonApiHelper.fetchData(
        options,
        params
      );
      return response?.data.eligible ?? false;
    } catch (error) {
      return false;
    }
  }

  public async setDialerCallback(body: any): Promise<any> {
    const options = {
      endpoint: this.configService.get("API_POS_ENDPOINT") + "/v1/dialer/push",
    };
    await this.commonApiHelper.postData(options, body);
  }

  public async uploadFile(formData: any): Promise<any> {
    const formDataNew = new FormData();
    const options = {
      endpoint: this.configService.get("API_POS_ENDPOINT") + "/v1/upload",
      config: {
        maxContentLength: 100000000,
        maxBodyLength: 1000000000,
      },
      headers: {
        ...formDataNew.getHeaders(),
      },
    };

    const res: AxiosResponse<any> = await this.commonApiHelper.postData(
      options,
      formData
    );

    return res.data;
  }

  public async generatePublicS3Link(file: Express.Multer.File, isImage = true) {
    const type = isImage ? "publicImages" : "publicDocs";
    const formData = new FormData();
    formData.append("file", file.buffer, file.originalname);
    formData.append("type", type);

    const { key, location } = await this.uploadFile(formData);

    //posstatic proxy available only on production
    const returnRawS3Url =
      this.configService.get("RETURN_RAW_PUBLIC_S3_URL") === "true";
    if (returnRawS3Url) {
      return location;
    }

    const publicS3BaseUrl = this.configService.get("PUBLIC_S3_BASE_URL");
    return new URL(key, publicS3BaseUrl).toString();
  }

  public async saveEStamp(body: SaveEStampBody): Promise<any> {
    const options = {
      endpoint: this.configService.get("API_POS_ENDPOINT") + "/v1/estamp",
    };

    const res: AxiosResponse<any> = await this.commonApiHelper.postData(
      options,
      body
    );

    return res.data;
  }

  public async getEStamps(query: GetEStampsQuery): Promise<any> {
    const options = {
      endpoint: this.configService.get("API_POS_ENDPOINT") + "/v1/estamp",
    };

    const res: AxiosResponse<any> = await this.commonApiHelper.fetchData(
      options,
      query
    );

    return res.data;
  }

  public async getUserDocuments(query: GetUserDocsQuery): Promise<any> {
    const options = {
      endpoint:
        this.configService.get("API_POS_ENDPOINT") + "/v1/user/documents",
    };

    const res: AxiosResponse<any> = await this.commonApiHelper.fetchData(
      options,
      query
    );

    return res.data;
  }

  public async fetchDocumentsUrlUsingPan(
    reqBody: GetKycDocQuery
  ): Promise<any> {
    const options = {
      endpoint: `${process.env.API_POS_ENDPOINT}/v1/kyc-docs`,
    };
    const response = await this.commonApiHelper.postData(options, reqBody);
    return response?.data;
  }

  public async getPolicyBookRatio(
    query: GetPolicyBookRatio
  ): Promise<PolicyBookRatioRes> {
    const options = {
      endpoint:
        this.configService.get("API_POS_ENDPOINT") +
        "/v1/lead/policy/book-ratio",
    };

    const res: AxiosResponse<PolicyBookRatioRes> =
      await this.commonApiHelper.fetchData(options, query);

    return res.data;
  }
}

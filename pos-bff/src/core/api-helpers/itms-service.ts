import CommonApiHelper from "../../services/helpers/common-api-helper";
import { HttpException, Injectable, Logger } from "@nestjs/common";

import EncryptionService from "../../services/encryption-service";
import { ItmsCreateRequestInterface } from "../../interfaces/offline/itms-create-request.interface";
import { UseCache } from "../../decorators/use-cache.decorator";
import ContextHelper from "../../services/helpers/context-helper";

const ITMS_CONFIG = {
  ENDPOINT_1: process.env.API_ITMS_ENDPOINT,
  ENDPOINT_2: process.env.API_ITMS_V2_ENDPOINT,
  BFF_ENFDPOINT: process.env.API_ITMS_BFF_ENDPOINT,
  GET_DETAILS_PATH: "/tickets/ins/offline/quotesDetails/",
  GET_DOCUMENT_DETAILS_PATH: "/getDocDetails",
  CREATE_TICKET_PATH: "/tickets/create/productType/offlinequotes/9",
  UPLOAD_QUOTE: "/uploadSelectedQuote",
  HEADERS: {
    "x-auth-id": process.env.API_ITMS_X_AUTH_ID,
    "x-auth-token": process.env.API_ITMS_X_AUTH_TOKEN,
  },
};

@Injectable()
export default class ItmsService {
  constructor(
    public apiHelper: CommonApiHelper,
    public encryptionService: EncryptionService
  ) {}

  public async shortenUrl(url: string): Promise<any> {
    try {
      if (!url) {
        throw "Invalid Url";
      }
      const endpoint = process.env.API_ITMS_ENDPOINT + "/urlShortner";

      const headers = {
        Authorization: ContextHelper.getStore().get("authorization"),
      };
      const params = { url };

      const options = {
        endpoint: endpoint,
        method: "GET",
        config: {
          headers,
        },
      };
      const response: any = await this.apiHelper.getData(options, params);
      if (!response.error) {
        Logger.debug(`URL shortened successfully`);
        return response;
      } else {
        throw "URL wasn't shortend";
      }
    } catch (e) {
      Logger.error("Error while shortening URL");
      throw e;
    }
  }

  public async updateProposalDoc(body: any): Promise<any> {
    Logger.debug(
      `updating proposal doc in ITMS ${body.ticket_id} ${body.doc_type} ${body.doc_name}`
    );
    const options = {
      endpoint: `${process.env.API_ITMS_V2_ENDPOINT}/api/v1/doc/${body.product_id}`,
      config: {
        headers: ITMS_CONFIG.HEADERS,
      },
    };
    const response: any = await this.apiHelper.postData(options, body);
    Logger.debug("update proposal doc API response received");
    if (response.status !== "T") {
      Logger.error(
        `update proposal doc API failed ${body.ticket_id}`,
        response
      );
      throw new HttpException(response.message, response.statusCode);
    }
    return response;
  }

  public async updatePreferredPlan(body: any): Promise<any> {
    Logger.debug(`updating preferred plan in ITMS ${body?.ticketId}`);
    const options = {
      endpoint: `${process.env.API_ITMS_ENDPOINT}/tickets/ins/offline/moreDetails`,
      config: {
        headers: ITMS_CONFIG.HEADERS,
      },
    };
    const response: any = await this.apiHelper.postData(options, body);
    Logger.debug("update preferred plan API response received");
    if (response?.data?.status !== 200) {
      Logger.error(
        `update preferred plan API failed ${body?.ticketId}`,
        response
      );
      throw new HttpException(response.message, response.statusCode);
    }
    return response;
  }

  async getOfflineDetails(ticketId: string) {
    const endpoint = `${ITMS_CONFIG.ENDPOINT_1}${ITMS_CONFIG.GET_DETAILS_PATH}${ticketId}?medium=POS`;
    const headers = ITMS_CONFIG.HEADERS;
    const options = {
      endpoint: endpoint,
      method: "GET",
      config: {
        headers: headers,
      },
    };
    return await this.apiHelper.getData(options, {});
  }

  async getOfflineDocDetails(query: any) {
    const endpoint = `${ITMS_CONFIG.ENDPOINT_1}${ITMS_CONFIG.GET_DOCUMENT_DETAILS_PATH}`;
    const headers = ITMS_CONFIG.HEADERS;
    const options = {
      endpoint: endpoint,
      method: "GET",
      config: {
        headers: headers,
      },
    };
    return this.apiHelper.getData(options, query);
  }

  async createOfflineTicket(itmsRequest: ItmsCreateRequestInterface) {
    const headers = ITMS_CONFIG.HEADERS;
    const options = {
      endpoint: ITMS_CONFIG.ENDPOINT_1 + ITMS_CONFIG.CREATE_TICKET_PATH,
      method: "POST",
      config: {
        headers,
      },
    };
    const res = await this.apiHelper.postData(options, itmsRequest);
    return res;
  }

  async updateOfflineTicket(id: string, body: any) {
    const endpoint = `${ITMS_CONFIG.ENDPOINT_1}/insofflinetickets/${id}/setStatus`;
    const headers = ITMS_CONFIG.HEADERS;
    const options = {
      endpoint,
      config: {
        headers,
      },
    };
    const offlineUpdateResponse = await this.apiHelper.putData(options, body);
    return offlineUpdateResponse;
  }

  async getHistory(id: string) {
    const endpoint = `${ITMS_CONFIG.ENDPOINT_1}/tickets/${id}/history`;
    const headers = ITMS_CONFIG.HEADERS;
    const options = {
      endpoint,
      method: "GET",
      config: {
        headers,
      },
    };
    return await this.apiHelper.getData(options, {});
  }

  public async sendSMS(body: any): Promise<any> {
    const options = {
      endpoint: process.env.API_ITMS_ENDPOINT + "/send_sms",
      config: {
        headers: {
          "x-auth-id": process.env.API_ITMS_X_AUTH_ID,
          "x-auth-token": process.env.API_ITMS_X_AUTH_TOKEN,
        },
      },
    };

    const response = await this.apiHelper.postData(options, body);
    return JSON.parse(response.data);
  }

  public async sendEmail(body: any): Promise<any> {
    const options = {
      endpoint:
        process.env.API_ITMS_COMMUNICATION_ENDPOINT + "/api/v2/send-email",
      config: {
        headers: {
          "x-auth-id": process.env.API_ITMS_X_AUTH_ID,
          "x-auth-token": process.env.API_ITMS_X_AUTH_TOKEN,
        },
      },
    };

    const response = await this.apiHelper.postData(options, body);
    return JSON.parse(response.data);
  }

  public async itmsSoftDelete(mobile: any): Promise<any> {
    try {
      const encryptionRequest = [mobile.toString()];
      const encryptedMobileData = await this.encryptionService.encrypt(
        encryptionRequest
      );
      let encryptedMobileNo = "";
      if (encryptedMobileData && encryptedMobileData[0].ecrypted) {
        encryptedMobileNo = encryptedMobileData[0].ecrypted;
      }
      const options = {
        endpoint: process.env.API_ITMS_ENDPOINT + "/users",
        config: {
          headers: {
            "Content-Type": "application/json",
            "x-auth-id": process.env.API_ITMS_X_AUTH_ID,
            "x-auth-token": process.env.API_ITMS_X_AUTH_TOKEN,
          },
        },
      };
      const reqBody = {
        mobileNo: encryptedMobileNo,
      };

      const response = await this.apiHelper.deleteData(options, reqBody);
      Logger.debug("itmssooftDeletionResponse ", {
        response: response,
      });
    } catch (error) {
      Logger.error("error while soft deleting ITMS Details", { error });
      return [];
    }
  }

  public async uploadSelectedQuote(body: any): Promise<any> {
    const endpoint = `${ITMS_CONFIG.ENDPOINT_1}${ITMS_CONFIG.UPLOAD_QUOTE}`;
    const headers = ITMS_CONFIG.HEADERS;
    const options = {
      endpoint,
      config: {
        headers,
      },
    };
    Logger.debug(`upload selected quote for ${body.ticketUuid}`, { body });
    const res = await this.apiHelper.postData(options, body);
    Logger.debug("response received from upload selected quote ITMS");
    return res;
  }

  @UseCache({ useObjectAsKey: true, expiryTimer: 86400 })
  async getITMSConfig(query: any) {
    const endpoint = `${process.env.API_ITMS_ENDPOINT}/getMultipleConfigs`;

    const options = {
      endpoint,
      config: {
        headers: ITMS_CONFIG.HEADERS,
      },
    };
    const response = await this.apiHelper.postData(
      options,
      query?.configs?.split(",")
    );
    Object.keys(response?.data).map((key) => {
      response.data[key] = JSON.parse(response.data[key]);
    });
    return response?.data;
  }

  public async getActiveTicketsOnRegNo(query: any): Promise<any> {
    const endpoint = `${process.env.API_ITMS_ENDPOINT}/checkActiveRegNo`;
    const options = {
      endpoint,
      config: {
        headers: ITMS_CONFIG.HEADERS,
      },
    };
    const response: any = await this.apiHelper.fetchData(options, query);
    if (response?.status === "T") {
      return response.data;
    }
    return [];
  }

  public async uploadDocument(formData: any, formHeaders: any): Promise<any> {
    const options = {
      endpoint: process.env.API_ITMS_ENDPOINT + `/uploadDoc`,
      config: {
        headers: {
          ...formHeaders,
          "x-auth-id": process.env.API_ITMS_X_AUTH_ID,
          "x-auth-token": process.env.API_ITMS_X_AUTH_TOKEN,
        },
      },
    };
    const apiResponse = await this.apiHelper.postData(options, formData);
    return apiResponse.data;
  }

  public async createLifeOfflineTicket(body: any): Promise<any> {
    const headers = ITMS_CONFIG.HEADERS;
    const options = {
      endpoint: `${ITMS_CONFIG.BFF_ENFDPOINT}/v1/api/life/create-offline-quotes?requestMedium=POS`,
      method: "POST",
      config: {
        headers,
      },
    };

    const res = await this.apiHelper.postData(options, body);
    return res?.data;
  }

  public async getLifeOfflineDetails(ticketId: string) {
    const endpoint = `${ITMS_CONFIG.BFF_ENFDPOINT}/v1/api/life/lifeOfflineTicketDetails`;
    const headers = ITMS_CONFIG.HEADERS;
    const options = {
      endpoint: endpoint,
      method: "GET",
      config: {
        headers,
      },
    };

    const params = {
      requestMedium: "POS",
      ticketUuId: ticketId,
    };
    const response: { data: any } = await this.apiHelper.fetchData(
      options,
      params
    );
    return response?.data;
  }

  public async getVideoVerificationConfigs(data: any) {
    const endpoint = `${ITMS_CONFIG.ENDPOINT_1}/inspection/v1/life/getConfigAndValidity`;
    const options = {
      endpoint,
      config: {
        headers: ITMS_CONFIG.HEADERS,
      },
    };
    return await this.apiHelper.fetchData(options, data);
  }

  public async saveVideo(data: any) {
    const options = {
      endpoint: `${ITMS_CONFIG.ENDPOINT_1}/inspection/v1/life/saveVideo`,
      config: {
        headers: {
          ...ITMS_CONFIG.HEADERS,
        },
      },
    };

    const res = await this.apiHelper.postData(options, data);
    return res;
  }

  public async createVideoVerificationLink(data: any) {
    const options = {
      endpoint: `${ITMS_CONFIG.BFF_ENFDPOINT}/v1/api/life/video-create-link?requestMedium=POS`,
      method: "POST",
      config: {
        headers: { ...ITMS_CONFIG.HEADERS },
      },
    };
    const formData = new FormData();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.append(key, data[key]);
      }
    }
    const res = await this.apiHelper.postData(options, formData);
    return res;
  }

  public async isInspectionProcessable(params, headers): Promise<any> {
    try {
      const options = {
        endpoint:
          process.env.API_ITMS_ENDPOINT + `/checkIfInspectionProcessable`,
        method: "GET",
        config: {
          headers,
        },
      };
      const response: any = await this.apiHelper.getData(options, params);
      return response;
    } catch (error) {
      Logger.error("error while fetching inspection statsus", error);
      throw new HttpException(
        error?.httpCode || 500,
        error?.message ?? "Error while fetching inspection statsus"
      );
    }
  }

  public async fetchDocsAndInspectionDetails(params, headers): Promise<any> {
    try {
      const options = {
        endpoint: process.env.API_ITMS_ENDPOINT + `/getDocDetails`,
        method: "GET",
        config: {
          headers,
        },
      };
      const response: any = await this.apiHelper.getData(options, params);
      return response;
    } catch (error) {
      Logger.error("error while fetching inspection data and docs", error);
      throw new HttpException(
        error?.httpCode || 500,
        error?.message ?? "error while fetching inspection data and docs"
      );
    }
  }

  public async getInspectionHistory(params, headers): Promise<any> {
    try {
      const options = {
        endpoint:
          process.env.API_ITMS_ENDPOINT +
          `/tickets/INS-UCD-${params.ticketId}/history`,
        method: "GET",
        config: {
          headers,
        },
      };
      const response: any = await this.apiHelper.getData(options, params);
      return response;
    } catch (error) {
      Logger.error("error while fetching inspection history", error);
      throw new HttpException(
        error?.httpCode || 500,
        error?.message ?? "error while fetching inspection history"
      );
    }
  }

  public async cancelInspection(params, loggedInUserUuid): Promise<any> {
    try {
      if (!params.customerUuid) {
        params.customerUuid = loggedInUserUuid;
      }
      const options = {
        endpoint: `${process.env.API_ITMS_ENDPOINT}/insucdtickets/INS-UCD-${params["ticket_id"]}/setStatus`,
        config: {
          headers: ITMS_CONFIG.HEADERS,
        },
        method: "PUT",
      };
      const response: any = await this.apiHelper.getData(options, {
        data: params,
      });
      return response;
    } catch (error) {
      Logger.error("error while fetching inspection history", error);
      throw new HttpException(
        error?.httpCode || 500,
        error?.message ?? "error while fetching inspection history"
      );
    }
  }
}

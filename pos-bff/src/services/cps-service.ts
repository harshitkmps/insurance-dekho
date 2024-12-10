import { Injectable, Logger } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import LsqService from "./lsq-service";

@Injectable()
export default class CpsService {
  constructor(
    private apiHelper: CommonApiHelper,
    private lsqService: LsqService
  ) {}

  public async isUserDetailsExistInCpsOrSfa(uuid: any): Promise<any> {
    try {
      const isUserExistInCps = await this.lsqService.getChannelPartnerDetails(
        uuid
      );
      Logger.debug("isUserExistInCps ", {
        isUserExistInCps: isUserExistInCps,
      });
      if (isUserExistInCps?.length > 0) {
        return true;
      }

      const isUserExistInSfa = await this.lsqService.getSalesPartnerDetails({
        iam_uuid: uuid,
      });
      Logger.debug("isUserExistInSfa ", {
        isUserExistInSfa: isUserExistInSfa,
      });
      if (isUserExistInSfa?.data?.length > 0) {
        return true;
      }
      return false;
    } catch (error) {
      Logger.error("error while searching user in cps or sfa", { error });
      return true;
    }
  }

  public async cpsSoftDelete(channelPartnerId: any): Promise<any> {
    try {
      const headers = {
        "Content-Type": "application/json",
      };
      const options = {
        endpoint:
          process.env.CHANNEL_PARTNER_SERVICE_ENDPOINT + `/${channelPartnerId}`,
        headers: headers,
      };
      const cpsData = {
        status: 0,
      };
      Logger.debug("CPS soft delete Data", cpsData);
      await this.apiHelper.putData(options, cpsData);
    } catch (error) {
      Logger.error("error while soft deleting CPS Details", { error });
      return [];
    }
  }
  public async cpsMapToRapTeam(data: any): Promise<any> {
    try {
      const headers = {
        "Content-Type": "application/json",
      };
      const options = {
        endpoint:
          process.env.CHANNEL_PARTNER_SERVICE_ENDPOINT_NEW +
          `/mapChannelPartners`,
        headers: headers,
      };
      const resposne = await this.apiHelper.postData(options, { data });
      return resposne.data;
    } catch (error) {
      Logger.error("error while mapping CPS Details", { error });
      throw error;
    }
  }
  public async fetchChannelPartner(params: any): Promise<any> {
    const headers = {
      "Content-Type": "application/json",
    };
    const options = {
      endpoint: process.env.CHANNEL_PARTNER_SERVICE_ENDPOINT,
      headers,
    };
    const response: any = await this.apiHelper.fetchData(options, params);
    return response?.data;
  }
}

import { Injectable, Logger } from "@nestjs/common";
import ConfigService from "./config-service";
import { config } from "../constants/config.constants";

@Injectable()
export default class PartnerEventService {
  constructor(private configService: ConfigService) {}

  public async getEventConfig({ eventSlug }: any): Promise<any> {
    const result = {
      status: false,
      name: null,
      date: null,
    };
    try {
      const configData = await this.configService.getConfigValueByKey(
        config.PARTNER_EVENT
      );
      if (!configData[eventSlug]) {
        return result;
      }
      result.status = true;
      result.name = configData[eventSlug].name;
      result.date = configData[eventSlug].date;
    } catch (error) {
      Logger.error("Error fetching event config", error);
    } finally {
      return result;
    }
  }
}

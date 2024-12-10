import Config from "@/models/mongo/config.schema";
import { logger } from "@/utils/logger";
import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { UseCache } from "@/decorators/use-cache.decorator";

@Service()
export default class ConfigService {
  @UseCache({ expiryTimer: 300 }) // 5 min
  public async getConfigValueByKey(key: string): Promise<any> {
    const config = await Config.findOne(
      { configKey: key },
      { configKey: 1, configValue: 1, status: 1 }
    ).lean();
    logger.info("got config value for key ", { key });
    if (!config) {
      logger.error("No config value found for key", { key });
      throw new HttpException(400, {
        success: false,
        message: "No config value found for key",
      });
    }

    if (!config.status) {
      logger.error("No active config value found for key", { key });
      throw new HttpException(400, {
        success: false,
        message: "No active config value found for key",
      });
    }

    return {
      success: true,
      config,
      error: null,
    };
  }
}

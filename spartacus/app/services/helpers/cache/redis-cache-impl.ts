import { redisClient } from "@app/config/dbs/redis"
import { ICache } from "./icache";
import logger from "@app/config/services/WinstonConfig";

export class RedisCacheImpl implements ICache {
  public async get(key: string): Promise<any> {
    try {
      const value = await redisClient.get(key);
      return value;
    } catch (error) {
      logger.error("error getting data from redis", error);
      return ;
    }
  }
  public async setWithExpiry(
    key: string,
    timeout: number,
    value: string
  ): Promise<any> {
    try {
      const response = await redisClient.setEx(key, timeout, value);
      return response;
    } catch (error) {
      logger.error("error setting data from redis", error);
      return ;
    }
  }

  public async resetCacheForKey(key: string): Promise<any> {
    try {
      logger.info("deleting cache for key", { key });
      await redisClient.del(key);
      return { cacheCleared: true };
    } catch (err) {
      logger.error("error resetting data by key in redis", err);
      return ;
    }
  }

  public async resetCacheForKeysByPattern(key: string): Promise<any> {
    try {
      logger.info("deleting cache for keys by pattern", { key });
      const keys = await redisClient.keys(`*${key}*`);
      if (!keys?.length) {
        return { cacheCleared: false };
      }
      keys.forEach((key) => redisClient.del(key));
      return { cacheCleared: true };
    } catch (err) {
      logger.error("error resetting data by key pattern in redis", err);
      return ;
    }
  }
}

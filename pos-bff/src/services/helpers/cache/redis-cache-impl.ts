import { Injectable, Logger } from "@nestjs/common";
import { ICache } from "./icache";
import { RedisRepository } from "@/src/config/database/redis.repository";

@Injectable()
export class RedisService implements ICache {
  constructor(private redisRepository: RedisRepository) {}
  public async get(key: string): Promise<any> {
    try {
      const value = await this.redisRepository.get(key);
      return value;
    } catch (error) {
      Logger.error("error getting data from redis", error);
      return null;
    }
  }
  public async setWithExpiry(
    key: string,
    timeout: number,
    value: string
  ): Promise<any> {
    try {
      const response = await this.redisRepository.setWithExpiry(
        key,
        value,
        timeout
      );
      return response;
    } catch (error) {
      Logger.error("error setting data from redis", error);
      return null;
    }
  }

  public async resetCacheForKey(key: string): Promise<any> {
    try {
      Logger.log("deleting cache for key", { key });
      await this.redisRepository.delete(key);
      return { cacheCleared: true };
    } catch (err) {
      Logger.error("error resetting data by key in redis", err);
      return null;
    }
  }

  public async resetCacheForKeysByPattern(key: string): Promise<any> {
    try {
      Logger.log("deleting cache for keys by pattern", { key });
      const keys = await this.redisRepository.keys(`*${key}*`);
      if (!keys?.length) {
        return { cacheCleared: false };
      }
      keys.forEach((key) => this.redisRepository.delete(key));
      return { cacheCleared: true };
    } catch (err) {
      Logger.error("error resetting data by key pattern in redis", err);
      return null;
    }
  }
}

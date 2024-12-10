import { ICache } from "./icache";
import { RedisCacheImpl } from "./redis-cache-impl";
export class CacheFactory {
  public static getCache(): ICache {
    return new RedisCacheImpl();
  }
}

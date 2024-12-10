import { CacheProperties } from "../interfaces/cache/cache-properties";
import { Inject, Logger } from "@nestjs/common";
import { RedisService } from "../services/helpers/cache/redis-cache-impl";

//to be used on async methods
function UseCache(
  cacheProperties: CacheProperties = { expiryTimer: 300 }
): MethodDecorator {
  const RedisServiceInjector = Inject(RedisService);
  return function (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    RedisServiceInjector(target, "redisService");
    Logger.debug(`initializing UseCache decorator ${propertyKey}`);
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const redisService = this.redisService as RedisService;
      try {
        const argsArr = [];
        for (const arg of args) {
          if (arg && typeof arg === "object") {
            if (cacheProperties?.useObjectAsKey) {
              const objectValues = Object.values(arg);
              if (objectValues?.length < 10) {
                objectValues.forEach((x) => argsArr.push(x));
              } else {
                throw new Error(
                  "Object keys limit reached for building cache key..."
                );
              }
            }
            continue;
          }
          argsArr.push(arg);
        }
        const cacheKey = `__cacheKey__${
          originalMethod.name
        }__${argsArr.toString()}`;
        const value = await redisService.get(cacheKey);
        if (!value) {
          Logger.log(
            `cache miss for key ${cacheKey}. Getting data from ${originalMethod.name}`
          );
          const data = await originalMethod.apply(this, args);
          await redisService.setWithExpiry(
            cacheKey,
            cacheProperties.expiryTimer,
            JSON.stringify(data)
          );
          Logger.debug(`value updated in cache ${cacheKey}`);
          return data;
        }
        Logger.log(`returning data from cache for key ${cacheKey}`);
        const parsedValue = JSON.parse(value);
        return parsedValue;
      } catch (error) {
        Logger.error("error while applying cache ", { error });
        const data = originalMethod.apply(this, args);
        return data;
      }
    };
  };
}

export { UseCache };

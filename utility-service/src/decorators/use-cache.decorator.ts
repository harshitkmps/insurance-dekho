import { Cache } from "@/config/cache-store";
import { CacheProperties } from "@/interfaces/cache/cache-properties";
import { logger } from "@/utils/logger";

function UseCache(cacheProperties: CacheProperties = { expiryTimer: 300 }) {
  return function (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    logger.info(`inside UseCache decorator`);
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
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
          }
          argsArr.push(arg);
        }
        const cacheClient = new Cache();
        const cacheKey = `__utility__${
          originalMethod.name
        }__${argsArr.toString()}`;
        const value = cacheClient.get(cacheKey);
        if (!value) {
          logger.info(
            `cache miss for key ${cacheKey}. Getting data from ${originalMethod.name}`
          );
          const data = await originalMethod.apply(this, args);
          const cacheResponse = cacheClient.setWithExpiry(
            cacheKey,
            cacheProperties.expiryTimer,
            data
          );
          logger.info(`value updated in cache ${cacheKey} -- ${cacheResponse}`);
          return data;
        }
        logger.info(`returning data from cache for key ${cacheKey}`);
        const parsedValue = JSON.parse(value);
        return parsedValue;
      } catch (error) {
        const data = originalMethod.apply(this, args);
        return data;
      }
    };
  };
}

export { UseCache };

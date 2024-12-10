import { CacheProperties } from "@app/interfaces/cache-properties"
import { CacheFactory } from "./cache/cache-factory"
import logger from "@app/config/services/WinstonConfig";
import ApiConstants from "@app/utils/constants/ApiConstants";

//to be used on async methods
function UseCache(cacheProperties: CacheProperties = { expiryTimer: ApiConstants.EXPIRATION_TIME.DEFAULT }) {
  return function (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    logger.info(`initializing UseCache decorator ${propertyKey}`);
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
            continue;
          }
          argsArr.push(arg);
        }
        const cacheClient = CacheFactory.getCache();
        const cacheKey = `__cacheKey__${
          originalMethod.name
        }__${argsArr.toString()}`;
        const value = await cacheClient.get(cacheKey);
        if (!value) {
          logger.info(
            `cache miss for key ${cacheKey}. Getting data from ${originalMethod.name}`
          );
          const data = await originalMethod.apply(this, args);
          const cacheResponse = await cacheClient.setWithExpiry(
            cacheKey,
            cacheProperties.expiryTimer,
            JSON.stringify(data)
          );
          logger.info(`value updated in cache ${cacheKey} -- ${cacheResponse}`);
          return data;
        }
        logger.info(`returning data from cache for key ${cacheKey}`);
        const parsedValue = JSON.parse(value);
        return parsedValue;
      } catch (error) {
        logger.error("error while applying cache ", error);
        const data = originalMethod.apply(this, args);
        return data;
      }
    };
  };
}

export { UseCache };

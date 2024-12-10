import { logger } from "@utils/logger";
import { v4 as uuid } from "uuid";

export function loggable() {
  return function (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    logger.info(`inside loggable decorator ${uuid()}`);
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      // const requestId = await contextUtils.get("traceId");
      // const createdBy = await contextUtils.get("uuid");
      const method = originalMethod.name;
      logger.info(`inside loggable decorator: [request] ${method}`, args);
      const data = await originalMethod.apply(this, args);
      logger.info(`inside loggable decorator: [response] ${method} ${data}`);
      return data;
    };
  };
}

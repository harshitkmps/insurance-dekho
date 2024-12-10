import { NextFunction, Request, Response } from "express";
import { logger } from "@utils/logger";
import asyncLocalStorage from "@/services/helpers/context-helper";
import { v4 as uuidv4 } from "uuid";
const requestMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const traceId = uuidv4();
  logger.debug("inside request middleware", { traceId });
  const map = new Map();
  const host = req.headers["x-forwarded-host"];
  const medium =
    req.headers.origin === process.env.X_FORWAREDED_POS_HOST ||
    req.headers["x-hostname"] === process.env.X_FORWAREDED_POS_HOST
      ? process.env.POS_MEDIUM
      : process.env.APP_MEDIUM;
  map.set("traceId", traceId);
  map.set("authorization", req.headers?.authorization);
  map.set(
    "x-correlation-id",
    req.headers["x-correlation-id"] != null
      ? req.headers["x-correlation-id"]
      : uuidv4()
  );
  map.set("host", host);
  map.set("medium", medium);
  asyncLocalStorage.run(map, () => next());
};

export default requestMiddleware;

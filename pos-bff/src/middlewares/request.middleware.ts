import { NextFunction, Request, Response } from "express";
import { Logger } from "@nestjs/common";
import asyncLocalStorage from "../services/helpers/context-helper";
import { v4 as uuidv4 } from "uuid";

async function requestMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const traceId = uuidv4();
  Logger.log("inside request middleware", {
    traceId,
    path: req.path,
    method: req.method,
    originalUrl: req.originalUrl,
    url: req.url,
  });
  const map = new Map();
  const host = req.headers["x-forwarded-host"];
  const medium =
    req.headers.origin === process.env.X_FORWAREDED_POS_APP_HOST ||
    req.headers["x-hostname"] === process.env.X_FORWAREDED_POS_APP_HOST
      ? process.env.APP_MEDIUM
      : process.env.POS_MEDIUM;
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
  asyncLocalStorage.run(map, next);
}

export default requestMiddleware;

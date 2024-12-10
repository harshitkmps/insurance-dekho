import logger from "../services/WinstonConfig";
import { createClient } from "redis";
import NewRelicHelper from "@app/utils/helpers/NewRelicHelper";
import { NewRelicEventTypes } from "@app/enums/NewRelicEventTypes";

logger.info("creating redis client");

const redisClient = createClient({
  url: process.env.REDIS_CONNECTION_URL,
  disableOfflineQueue: true,
  isolationPoolOptions: {
    max: 20,
    min: 5,
    idleTimeoutMillis: 10000,
  },
});

redisClient.on("error", (err) => {
  NewRelicHelper.emitCustomEvent(NewRelicEventTypes.RedisError, {});
  logger.error("Redis Client Error", err);
});
redisClient.on("connect", () => {
  logger.info("Redis Client connected");
});
redisClient.on("disconnect", (err) => {
  NewRelicHelper.emitCustomEvent(NewRelicEventTypes.RedisDisconnect, {});
  logger.info("Redis Client disconnected", err);
});
redisClient.on("ready", () => {
  logger.info("Redis Client ready");
});
redisClient.connect();

export { redisClient };

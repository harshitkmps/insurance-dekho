import { FactoryProvider, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";

export const redisClientFactory: FactoryProvider<Redis> = {
  provide: "REDIS_CLIENT",
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const redisClient = new Redis({
      host: await configService.get("REDIS_HOST"),
      port: await configService.get("REDIS_PORT"),
      enableOfflineQueue: false,
    });

    redisClient.on("error", (err) => {
      Logger.error("Redis Client Error", { err });
    });
    redisClient.on("connect", () => {
      Logger.log("Redis Client connected");
    });
    redisClient.on("disconnect", (err) => {
      Logger.error("Redis Client disconnected", { err });
    });
    redisClient.on("ready", () => {
      Logger.log("Redis Client ready");
    });
    return redisClient;
  },
};

import { ConfigService } from "@nestjs/config";
import winston from "winston";
import winstonDaily from "winston-daily-rotate-file";
import contextHelper from "../services/helpers/context-helper";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

export const createWinstonModuleOptions = () => {
  const level = () => {
    const configService = new ConfigService();
    return configService.get("LOG_LEVEL");
  };

  const getTraceId = () => {
    return contextHelper.getStore()?.get("traceId");
  };

  const transport = () => {
    const configService = new ConfigService();
    const isProductionEnv = configService.get("NODE_ENV") === "production";

    if (isProductionEnv) {
      return [];
    }

    return [
      new winstonDaily({
        level: "error",
        datePattern: "YYYY-MM-DD",
        dirname: "logs/error", // log file /logs/debug/*.log in save
        filename: "%DATE%.log",
        maxFiles: 30, // 30 Days saved
        json: false,
        handleExceptions: true,
        zippedArchive: true,
      }),
      new winstonDaily({
        datePattern: "YYYY-MM-DD",
        dirname: "logs/debug", // log file /logs/debug/*.log in save
        filename: "%DATE%.log",
        maxFiles: 30, // 30 Days saved
        json: false,
        zippedArchive: true,
      }),
    ];
  };

  const colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "white",
  };

  winston.addColors(colors);

  const format = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    // winston.format.colorize(),
    winston.format.splat(),
    winston.format.metadata({
      fillExcept: ["message", "level", "timestamp", "label"],
    }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
      const traceId = getTraceId();
      const msg = { timestamp, level, message, traceId, ...metadata };
      return JSON.stringify(msg);
    })
  );

  const transports = [new winston.transports.Console(), ...transport()];

  return {
    level: level(),
    levels,
    format,
    transports,
  };
};

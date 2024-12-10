import * as path from 'path';
import * as fs from 'fs';
import { createLogger, transports, format } from 'winston'; // Rename Logger to WinstonLogger
import DailyRotateFile = require('winston-daily-rotate-file'); // Use require syntax for the type
import asyncLocalStorage from 'src/common/context/local-storage';
import { v4 } from 'uuid';
// private logger: WinstonLogger; // Use the renamed Logger class

const rootDirectory = process.cwd();
const logDirectory = path.join(rootDirectory, 'logFiles'); // Define the log directory

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'MM/DD/YYYY, h:mm:ss A' }),
    format.ms(),
    format.simple(),
    format.printf((info) => {
      const localStorage = asyncLocalStorage;
      const correlationId = (localStorage.getStore() ?? v4()).get(
        'x-correlation-id',
      );
      return `${info.timestamp} ${info.level.padEnd(5)} [${correlationId}] - ${
        info.message
      }`;
    }),
  ),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      dirname: logDirectory,
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '200m',
      maxFiles: '7d',
    }),
    new DailyRotateFile({
      dirname: logDirectory,
      level: 'error',
      filename: 'application-error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '200m',
      maxFiles: '7d',
    }),
  ],
});

const logMessage = (message: string) => {
  logger.info(`\u001b[32m${message}`);
};

const logError = (message: string) => {
  logger.error(`\x1b[31m${message}`);
};

const logWarn = (message: string) => {
  logger.warn(`\u001b[33m${message}`);
};

const logDebug = (message: string) => {
  logger.debug(`\u001b[32m${message}`);
};

export { logMessage, logError, logWarn, logDebug };

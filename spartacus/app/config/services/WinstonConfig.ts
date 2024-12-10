/**
 * Author - Ankit Shukla
 * used for logging purposes.
 * passed as stream to morgan middleware.
 */

import { v4 } from 'uuid';
const winston = require('winston');
const currentDate = new Date().toDateString().replace(/ /g, '_');
import storageHelper from "@helpers/StorageHelper";
import Constants from "@constants/Constants";
import CommonHelper from "@helpers/CommonHelper";

const levels = {
  error : 0,
  warn  : 1,
  info  : 2,
  http  : 3,
  debug : 4,
};

const level = () => {
  return 'debug';
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
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.splat(),
  winston.format.metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
  winston.format.json(),
  winston.format.printf(
     (info: any) => {
        let correlation_id:string;
        if(storageHelper.storage.getStore()) {
            correlation_id = storageHelper.storage.getStore().get("x-correlation-id");
        }
        else {
            correlation_id = v4();
        }
        return `${CommonHelper.getDateTime()} { "${Constants.CORRELATOR.X_CORRELATION_ID}" :  "${correlation_id}" } ${info.level}: ${(info.message)}`
    },
  ),
);

const transports = [
    new winston.transports.Console({
        format: format,
    }),
    new winston.transports.File({
        level: level(),
        filename: process.env.PWD+'/logs/CIS_'+currentDate+'.log',
        handleExceptions: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: format,
    })
];

const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

logger.exceptions.handle(
    new winston.transports.File({ filename:  process.env.PWD+'/logs/fatals/fatals_'+currentDate+'.log' })
  );
logger.exitOnError = false;  

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function(message:any) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};

export default logger;
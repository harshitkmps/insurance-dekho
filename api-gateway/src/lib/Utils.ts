import moment = require("moment-timezone");
moment.tz.setDefault("Asia/Calcutta");
import { ResponseFormatter } from "../lib/ResponseFormatter";

import _ = require("lodash");
import { NextFunction, Request } from "express";
import async from "async";
import { String } from "aws-sdk/clients/apigateway";
export class Utils {

    public static capitalize(str: string) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }

    public static getDeepCopy(jsonData: any) {
        return JSON.parse(JSON.stringify(jsonData));
    }

    /**
     * checks if a data type is undefined or not
     * @param data
     * @returns {boolean}
     */
    public static isset(data: any): boolean {
        return typeof data !== "undefined";
    }

    /**
     * returns true if data is '' or null or undefined
     * for object, checks if it's length is non zero or not
     * @param data {Mixed}
     * @param zeroIsNotEmpty {boolean}: pass true only if you want 0 to be considered as non-empty
     * @returns {boolean}
     */
    public static isEmpty(data: any, zeroIsNotEmpty: boolean = false): boolean {

        if (typeof data !== "object" && (data === null || data === "" || typeof data === "undefined")) {
            return true;
        } else if (data === null) {
            return true;
        } else if (typeof data === "string" && data === "0" && !zeroIsNotEmpty) {
            return true;
        } else if (typeof data.length !== "undefined") {
            if (data.length > 0) {
                return false;
            } else {
                return true;
            }
        } else {
            if (Object.keys(data).length > 0) {
                return false;
            } else if (typeof data === "number" && (data !== 0 || zeroIsNotEmpty)) {
                return false;
            } else {
                if (data === true) {
                    return false;
                }
                return true;
            }
        }
    }

    public static executeInSeries(operations: any[], opType: string, next: NextFunction) {
        try {
            async.series(operations, (err: any) => {
                if (err) {
                    const errBody = err && err.err && err.err.body ? err.err.body : err;
                    const error = ResponseFormatter.getErrorResponseWithBody(500, "MID001", opType + " Execution Error", errBody);
                    next({ data: error });
                }
                console.log(opType, " Execution Done");
                return next();
            });

        } catch (err) {
            return err;
        }
    }

    constructor() {
    }
}

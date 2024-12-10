import redis = require("redis");

import moment = require("moment-timezone");
moment.tz.setDefault("Asia/Calcutta");
import { C } from "../constants/constants";
import _ = require("lodash");
import { utils } from "mocha";
export let apiGatewayConfiguration: any = null;
export let redisConnection: any = null;
import {Utils as u} from "../../lib/Utils";

export class RedisClient {

    public readonly TOTAL_RETRY_TIME: number = 1000 * 60 * 60;

    public readonly TOTAL_RETRY_ATTEMPTS: number = 600;

    constructor() {
        this.getRedisConnection();
    }

    public async getRedisConnection() {
        try {
            if (redisConnection) {
                return Promise.resolve(redisConnection);
            } else {
                const options: redis.ClientOpts = {
                    host: C.redisConfig.host,
                    port: C.redisConfig.port,
                    retry_strategy : (rOptions: any) => {
                        if (rOptions.total_retry_time > this.TOTAL_RETRY_TIME) {
                            return new Error("Retry time exhausted");
                        }
                        if (rOptions.attempt > this.TOTAL_RETRY_ATTEMPTS) {
                            return new Error("Max attempts reached");
                        }
                        if (rOptions.error && rOptions.error.code === "ECONNREFUSED") {
                            return 500;
                        }
                        return Math.min(rOptions.attempt * 100, 3000);
                    },
                };

                redisConnection = redis.createClient(options);
                redisConnection.on("ready", () => {
                    console.log("Redis client is ready");
                });

                redisConnection.on("connect", () => {
                    console.log("Redis client connected");
                });

                redisConnection.on("error", (err: any) => {
                    console.log("Something went wrong ", err);
                });

                redisConnection.on("reconnecting", () => {
                    console.log("Redis client is reconnecting");
                });
                return Promise.resolve(redisConnection);
            }
        } catch (err) {
            redisConnection = null;
            return Promise.reject(err);
        }
    }

    public async getRedisData(param: any) {
        return new Promise((resolve, reject) => {
            try {
                redisConnection.get(param, (err: any, result: any) => {
                    if (err) {
                        return reject(err);
                    }
                    result = JSON.parse(result);
                    return resolve(result);
                });
            } catch (Ex) {
                return reject(Ex);
            }
        });
    }

    public async hget(redisKey: string, param: any) {
        return new Promise((resolve, reject) => {
            try {
                redisConnection.hget(redisKey, param, (err: any, result: any) => {
                    if (err) {
                        return reject(err);
                    }
                    result = JSON.parse(result);
                    return resolve(result);
                });
            } catch (Ex) {
                return reject(Ex);
            }
        });
    }

    public async setRedisData(key: any, dataSet: any, ttl: number = 0) {

        return new Promise((resolve, reject) => {
            try {
                const data: any = JSON.stringify(dataSet);
                if (ttl > 0) {
                    redisConnection.set(key, data, "PX", ttl, (err: any, val: any) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(val);
                    });
                } else {
                    redisConnection.set(key, data, (err: any, val: any) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(val);
                    });
                }
            } catch (ex) {
                return reject(ex);
            }
        });
    }

    public async hset(redisKey: string, field: string, value: any) {

        return new Promise((resolve, reject) => {
            try {
                const data: any = JSON.stringify(value);
                redisConnection.hset(redisKey, field, data, (err: any, val: any) => {

                    if (err) {
                        return reject(err);
                    }
                    return resolve(val);
                });
            } catch (ex) {
                return reject(ex);
            }
        });

    }

    public async deleteRedisKey(redisKey: string) {
        console.log("redisKey", redisKey);
        return new Promise((resolve, reject) => {
            try {
                redisConnection.del(redisKey, (err: any, val: any) => {
                    console.log("aaa", err, val);
                    if (err) {
                        return reject(err);
                    }
                    return resolve(val);
                });
            } catch (ex) {
                return reject(ex);
            }
        });

    }

}

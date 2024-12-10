import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { UseCache } from "../decorators/use-cache.decorator";
import { CACHE_KEY, DataType, status } from "../constants/config.constants";
import { ConfigTable } from "../models/tbl-config.schema";
import moment from "moment";
import { LIVE_TRAINING } from "../constants/homepage.constants";
import { RedisService } from "./helpers/cache/redis-cache-impl";
import { BusinessUnitTable } from "../models/tbl-business-unit.schema";

@Injectable()
export default class ConfigService {
  constructor(private redisService: RedisService) {}

  @UseCache({ expiryTimer: 1800 })
  public async getConfigFromDb(): Promise<any> {
    Logger.debug("getting config variables from db");
    const configs = await ConfigTable.findAll({
      attributes: [
        ["config_name", "key"],
        ["config_values", "value"],
        ["data_type", "type"],
      ],
      where: {
        status: status.ACTIVE,
      },
      raw: true,
    });
    return configs;
  }

  public async getConfigValueByKey(key: string): Promise<any> {
    const configs = await this.getConfigFromDb();
    Logger.debug(`config value for key ${key}`);
    const configData = configs.find((config: any) => config.key === key);
    if (!configData) {
      throw new HttpException(
        "No config found for given key",
        HttpStatus.BAD_REQUEST
      );
    }
    if (configData.type === DataType.JSON && configData.value) {
      return JSON.parse(configData.value);
    }
    return configData.value;
  }

  public async clearCache(key: string, exactMatch: boolean) {
    if (exactMatch) {
      const { cacheCleared } = await this.redisService.resetCacheForKey(key);
      const msg = cacheCleared
        ? "Cache Cleared"
        : "Invalid Redis Key or No cache data present";
      return { cacheCleared, msg };
    }

    for (const cacheKey of Object.values(CACHE_KEY)) {
      if (key.includes(cacheKey)) {
        const { cacheCleared } =
          await this.redisService.resetCacheForKeysByPattern(key);
        const msg = cacheCleared
          ? "Cache Cleared"
          : "No redis keys found with the pattern or no cache data present";
        return { cacheCleared, msg };
      }
    }
    return {
      cacheCleared: false,
      msg: "Not a BFF Cache Key pattern",
    };
  }

  public checkConditions(conditions: any[], userDetails: object): boolean {
    let validate = true;

    //sample conditions
    /*"conditions" : [
      {
        "type": "array",
        "key": "refer_dealer_id",
        "value": [
          null
        ],
        "match": false
      },
      {
        "type": "array",
        "key": "pos_role_id",
        "value": [
          1,
          2,
          3,
          4
        ],
        "match": true
      }
      ]*/

    if (!conditions?.length) {
      return validate;
    }

    conditions.every((condition) => {
      if (
        condition.match &&
        !condition.value.includes(userDetails[condition.key])
      ) {
        Logger.debug("in condition match object", {
          condition,
          value: userDetails[condition.key],
        });
        validate = false;
        return false;
      }
      if (
        !condition.match &&
        condition.value.includes(userDetails[condition.key])
      ) {
        Logger.debug("in condition not match object", {
          condition,
          value: userDetails[condition.key],
        });
        validate = false;
        return false;
      }
      return true;
    });
    return validate;
  }

  public orderSessions(a: any, b: any) {
    if (a.isActive && !b.isActive) {
      return -1;
    }
    if (!a.isActive && b.isActive) {
      return 1;
    } else {
      if (a.isActiveDay && !b.isActiveDay) {
        return -1;
      }
      if (!a.isActiveDay && b.isActiveDay) {
        return 1;
      } else {
        if (a.startTime < b.startTime) {
          return -1;
        }
        if (a.startTime > b.startTime) {
          return 1;
        } else {
          return 0;
        }
      }
    }
  }

  public timeStampFromConfigTime(time: any) {
    const date = new Date();
    const [hours, minutes] = time.split(":");
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date.getTime() - 330 * 60 * 1000;
  }

  public isActiveSession(startTime: any, endTime: any) {
    const sessionStartTime = this.timeStampFromConfigTime(startTime);
    const sessionEndTime = this.timeStampFromConfigTime(endTime);
    const currentTime = new Date().getTime();
    const oneHourLaterTime = currentTime + 60 * 60 * 1000;
    Logger.log("is active session", {
      sessionStartTime,
      sessionEndTime,
      oneHourLaterTime,
      currentTime,
    });
    return oneHourLaterTime >= sessionStartTime && currentTime < sessionEndTime;
  }

  public checkConfigArrOfConditions(
    configArr: any[],
    userDetails: object,
    requestOrigin: string
  ): any {
    const matchedConfig = [];
    const currTime = moment().add(5, "hours").add(30, "minutes").toISOString();
    for (const configObj of configArr) {
      if (
        configObj?.dateRange?.from &&
        !(
          currTime >= configObj.dateRange.from &&
          currTime <= configObj.dateRange.to
        )
      ) {
        Logger.debug("config arr of conditions, time not matched for:", {
          from: configObj.dateRange.from,
          to: configObj.dateRange.to,
          momentTime: currTime,
        });
        continue;
      }
      const shouldShowConfig = this.checkConditions(
        configObj.conditions,
        userDetails
      );
      if (!shouldShowConfig) {
        Logger.debug(
          "in check config arr of conditions, criteria not matched for:",
          { configObj }
        );
        continue;
      }
      const newConfigObj = {
        ...configObj,
      };
      newConfigObj.link =
        requestOrigin === process.env.POS_MEDIUM
          ? newConfigObj.webLink
          : newConfigObj.appLink;
      if (newConfigObj.title === LIVE_TRAINING) {
        newConfigObj.sessions.forEach((ele) => {
          if (ele.daysExpression[new Date().getDay()] === "1") {
            ele.isActive = this.isActiveSession(ele.startTime, ele.endTime);
            ele.isActiveDay = true;
          } else {
            ele.isActive = false;
            ele.isActiveDay = false;
          }
        });
        newConfigObj.sessions.sort(this.orderSessions);
      }
      delete newConfigObj.conditions;
      if (newConfigObj.pushInConfigWithoutLink) {
        delete newConfigObj.pushInConfigWithoutLink;
        matchedConfig.push(newConfigObj);
        continue;
      }
      delete newConfigObj.appLink;
      delete newConfigObj.webLink;
      if (newConfigObj.link) {
        matchedConfig.push(newConfigObj);
      }
    }

    return matchedConfig;
  }

  public checkUserProperties(
    otherProductLobs: any[],
    userDetails: any,
    eligibleRMList: string[]
  ): any {
    try {
      Logger.debug("get user details from User Properties collection", {
        userInfo: userDetails?.gcd_code,
        otherProductLobs,
        userDetails,
      });
      const finalOtherLobs = [];
      otherProductLobs.map(async (product) => {
        if (product?.isEnableKey) {
          if (
            userDetails?.[product?.isEnableKey] ||
            eligibleRMList.indexOf(userDetails?.uuid) > -1
          ) {
            finalOtherLobs.push(product);
          }
        } else {
          const shouldShowConfig = this.checkConditions(
            product.conditions,
            userDetails
          );
          if (shouldShowConfig) {
            finalOtherLobs.push(product);
          }
        }
      });
      return finalOtherLobs;
    } catch (err) {
      Logger.error(err);
    }
  }

  @UseCache({ expiryTimer: 24 * 60 * 60 })
  public async fetchBusinessUnits(): Promise<any> {
    const businessUnits = await BusinessUnitTable.findAll({
      attributes: ["id", "name"],
    });
    return businessUnits;
  }
}

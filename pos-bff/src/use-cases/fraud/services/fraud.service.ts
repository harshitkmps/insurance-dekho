import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { AxiosResponse } from "axios";
import CommonApiHelper from "../../../services/helpers/common-api-helper";
import { AttributeDto } from "../dtos/attributes-request";
import {
  BlacklistUserProfile,
  BlacklistUserProfileRes,
  UniqueDeviceMap,
  FraudResponseDto,
  GetBlacklistUsersRes,
  GetBlacklistedUserByIdRes,
  GetFraudUsersRes,
  ListingBlacklistedUser,
  TransformedUserActivity,
  UserActivityInfo,
} from "../dtos/fraud-response";
import { FRAUD_CONFIG } from "../../../config/api";
import {
  AttributeCount,
  AttributeStats,
} from "../dtos/attribute-count-res.interface";
import ConfigService from "@/src/services/config-service";
import { config } from "@/src/constants/config.constants";
import {
  GetBlacklistUsersDto,
  GetBlacklistUsersParams,
} from "../dtos/get-blacklist-users.dto";
import {
  GetBlacklistUserByIdParams,
  GetBlacklistUserByIdQuery,
} from "../dtos/get-blacklist-user-by-id.dto";
import { UpdateFraudUserReq } from "../dtos/update-fraud-user.dto";
import { UpdateFraudUserRes } from "../dtos/update-fraud-user-res.interface";
import { AttributeKeyConfig } from "../dtos/get-attribute-keys-res.interface";
import { PatchFraudUserByIdBody } from "../dtos/update-fraud-user-by-id.dto";
import moment from "moment";
import ApiPosService from "@/src/services/apipos-service";
import CommonUtils from "@/src/utils/common-utils";
import { SearchUserRes } from "@/src/interfaces/api-pos/search-user.interface";

@Injectable()
export default class FraudService {
  constructor(
    private readonly apiHelper: CommonApiHelper,
    private readonly configService: ConfigService,
    private readonly apiPosService: ApiPosService
  ) {}

  public async prepareAttributeList(): Promise<AttributeKeyConfig[]> {
    const [attributes, fraudConfig] = await Promise.all([
      this.getAttributeList(),
      this.configService.getConfigValueByKey(config.FRAUD_MITIGATION),
    ]);

    const attributeConfigList: AttributeKeyConfig[] = attributes.map(
      (attribute) => ({
        key: attribute,
        value: fraudConfig.attributeName[attribute].name,
      })
    );

    return attributeConfigList;
  }

  public async getAttributeList(): Promise<string[]> {
    const options = {
      config: FRAUD_CONFIG,
      endpoint: process.env.FRAUD_SERVICE_ENDPOINT + "/api/v1/attributes/keys",
    };

    const fraudReponse: AxiosResponse<string[]> =
      await this.apiHelper.fetchData(options, {});
    return fraudReponse.data;
  }

  public async unblockAttribute(attribute: AttributeDto) {
    const options = {
      config: FRAUD_CONFIG,
      endpoint: process.env.FRAUD_SERVICE_ENDPOINT + "/api/v1/attributes",
    };

    const body = attribute;
    const response: FraudResponseDto = await this.apiHelper.deleteData(
      options,
      {
        data: [body],
      }
    );
    if (response?.status === 200) {
      return "Successfuly Unblocked the attribute";
    }
    throw new HttpException(
      response?.message ?? "Unable to unblock attribute",
      response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public async blockAttribute(attribute: AttributeDto): Promise<any> {
    const options = {
      config: FRAUD_CONFIG,
      endpoint: process.env.FRAUD_SERVICE_ENDPOINT + "/api/v1/attributes",
    };

    const body = attribute;
    const response: FraudResponseDto = await this.apiHelper.postData(options, {
      data: [body],
    });
    if (response.status === 200) {
      return "Successfuly Blocked the attribute";
    }

    throw new HttpException(
      response?.message ?? "Unable to block attribute",
      response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public async searchAttributes(attribute: AttributeDto) {
    const options = {
      config: FRAUD_CONFIG,
      endpoint:
        process.env.FRAUD_SERVICE_ENDPOINT + "/api/v1/attributes/search",
    };
    const body = attribute;
    const response: any = await this.apiHelper.postData(options, {
      data: [body],
    });
    if (response?.status === 200 && response?.data?.length) {
      return response.data[0];
    }
    throw new HttpException(
      response?.message ?? "Unable to search attributes",
      response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public async getBlacklistedAttributeStats(): Promise<AttributeStats[]> {
    const [attributesCount, fraudConfig] = await Promise.all([
      this.getAttributeCount(),
      this.configService.getConfigValueByKey(config.FRAUD_MITIGATION),
    ]);
    const attributeStats: AttributeStats[] = [];
    for (const attributeInfo of attributesCount) {
      const attributeStat: AttributeStats = {
        ...fraudConfig.attributeName[attributeInfo.key],
        count: attributeInfo.count,
      };
      attributeStats.push(attributeStat);
    }
    return attributeStats;
  }

  public async getAttributeCount(): Promise<AttributeCount[]> {
    const options = {
      endpoint: process.env.FRAUD_SERVICE_ENDPOINT + "/api/v1/attributes/count",
    };
    const response: AxiosResponse<AttributeCount[]> =
      await this.apiHelper.fetchData(options, {});

    return response.data;
  }

  public async getBlacklistedUserList(
    query: GetBlacklistUsersDto
  ): Promise<GetFraudUsersRes> {
    const fraudConfig = await this.configService.getConfigValueByKey(
      config.FRAUD_MITIGATION
    );

    const params: GetBlacklistUsersParams = {
      ...fraudConfig?.blacklistUserListing,
      ...query,
    };

    const blacklistedUsers = await this.getBlacklistedUsers(params);
    const listingUsers: ListingBlacklistedUser[] = blacklistedUsers.users?.map(
      (blacklistedUser) => {
        const {
          _id,
          status,
          updatedAt,
          uuid,
          primaryAttributes = {},
        } = blacklistedUser;
        const updatedPrimaryAttributes = { ...primaryAttributes };
        for (const key of Object.keys(updatedPrimaryAttributes)) {
          updatedPrimaryAttributes[key] =
            updatedPrimaryAttributes[key] || "N/A";
        }
        return {
          id: _id,
          uuid: uuid || "N/A",
          ...updatedPrimaryAttributes,
          status,
          updatedAt,
        };
      }
    );

    return {
      users: listingUsers,
      meta: blacklistedUsers.meta,
    };
  }

  public async getBlacklistedUsers(
    params: GetBlacklistUsersParams
  ): Promise<GetBlacklistUsersRes> {
    const options = {
      endpoint: process.env.FRAUD_SERVICE_ENDPOINT + "/api/v1/fraud/users",
    };
    const response: AxiosResponse<GetBlacklistUsersRes> =
      await this.apiHelper.fetchData(options, params);

    return response.data;
  }

  public async getBlacklistedUserProfile(
    id: string,
    query: GetBlacklistUserByIdQuery
  ): Promise<BlacklistUserProfileRes> {
    const fraudConfig = await this.configService.getConfigValueByKey(
      config.FRAUD_MITIGATION
    );
    const blacklistUserProfileConfig = fraudConfig.blacklistUserProfile;
    const params: GetBlacklistUserByIdParams = {
      fetchUserActivity: true,
      ...blacklistUserProfileConfig,
      ...query,
    };

    const userProfile = await this.getBlacklistedUserById(id, params);

    const searchedUser = await this.apiPosService.searchUser({
      uuid: userProfile.blacklistedUser?.lastUpdatedBy,
      projections: "uuid,first_name",
    });

    return this.transformBlacklistUserResponse(userProfile, searchedUser);
  }

  public async getBlacklistedUserById(
    id: string,
    params: GetBlacklistUserByIdParams
  ): Promise<GetBlacklistedUserByIdRes> {
    const options = {
      endpoint:
        process.env.FRAUD_SERVICE_ENDPOINT + "/api/v1/fraud/users/" + id,
    };
    const response: AxiosResponse<GetBlacklistedUserByIdRes> =
      await this.apiHelper.fetchData(options, params);

    return response.data;
  }

  public async updateUserFraudStatus(
    body: UpdateFraudUserReq
  ): Promise<UpdateFraudUserRes> {
    const options = {
      endpoint: process.env.FRAUD_SERVICE_ENDPOINT + "/api/v1/fraud/users",
    };
    const response: AxiosResponse<UpdateFraudUserRes> =
      await this.apiHelper.postData(options, body);

    return response.data;
  }

  public async updateFraudUserById(
    id: string,
    body: PatchFraudUserByIdBody
  ): Promise<UpdateFraudUserRes> {
    const options = {
      endpoint:
        process.env.FRAUD_SERVICE_ENDPOINT + "/api/v1/fraud/users/" + id,
    };
    const response: AxiosResponse<UpdateFraudUserRes> =
      await this.apiHelper.patchData(options, body);

    return response.data;
  }

  public transformBlacklistUserResponse(
    userProfile: GetBlacklistedUserByIdRes,
    searchedUser: SearchUserRes
  ): BlacklistUserProfileRes {
    const userDetail = userProfile.blacklistedUser;

    const transformedUser: BlacklistUserProfile = {
      name: userDetail.primaryAttributes?.name || "Unknown",
      gcdCode: userDetail.primaryAttributes?.gcdCode || "N/A",
      mobileMasked: userDetail.primaryAttributes?.mobileMasked || "N/A",
      emailMasked: userDetail.primaryAttributes?.emailMasked || "N/A",
      panMasked: userDetail.primaryAttributes?.panMasked || "N/A",
      dob: userDetail.primaryAttributes?.dob
        ? moment(userDetail.primaryAttributes.dob).format("DD/MM/YYYY")
        : "N/A",
      address: userDetail.primaryAttributes?.address || "N/A",
      creationDate: userDetail.primaryAttributes?.creationDate
        ? moment(userDetail.primaryAttributes?.creationDate).format(
            "DD MMM YYYY"
          )
        : "N/A",
      status: userDetail.status,
      blacklistAttributeKey: userDetail.blacklistAttribute,
      blacklistAttributeValue: userDetail.blacklistValue,
      cta: userDetail.status === "BLOCKED" ? "Unblock" : "Block",
    };

    const currentStatus =
      userDetail.status === "BLOCKED" ? "blocked" : "unblocked";
    const tagColor = userDetail.status === "BLOCKED" ? "red" : "green";
    const activities: TransformedUserActivity[] = [
      {
        category: CommonUtils.capitalizeFirstLetterOfEachWord(
          moment(userDetail.updatedAt).fromNow(),
          " "
        ),
        info: [
          {
            heading: `${searchedUser.first_name} ${currentStatus} this user`,
            tag: userDetail.status,
            date: moment(userDetail.updatedAt).format("DD MMM, YY"),
            time: moment(userDetail.updatedAt)
              .add(5, "hours")
              .add(30, "minutes")
              .format("hh:mmA"),
            tagColor,
          },
        ],
      },
    ];

    const deviceMap: UniqueDeviceMap = {};

    for (const activityLog of userProfile.userActivity) {
      const userAgent = activityLog?.userAgentDetails;
      const category: string = CommonUtils.capitalizeFirstLetterOfEachWord(
        moment(activityLog.timeOfActivity).fromNow(),
        " "
      );
      let heading: string = userDetail.primaryAttributes?.name;
      if (activityLog.eventName === "APP_LOGIN") {
        heading += ` logged in at ${
          activityLog.deviceName ?? "unknown device"
        }`;
      } else if (activityLog.eventName === "WEB_LOGIN") {
        heading += ` logged in at ${userAgent?.os?.name}-${userAgent?.browser?.name}`;
      } else {
        heading += ` visited ${CommonUtils.convertCamelCaseToStr(
          activityLog.eventName || "",
          true
        )}`;
      }
      if (
        activityLog?.canvasFingerprint &&
        !deviceMap[activityLog.canvasFingerprint]
      ) {
        deviceMap[activityLog.canvasFingerprint] = {
          name: userAgent?.browser?.name ?? "N/A",
          lastLogin: moment(activityLog.timeOfActivity).format("DD MMM, YY"),
          activityDate: moment(userDetail.updatedAt).format("DD MMM, YY"),
          currentStatus: CommonUtils.capitalizeFirstLetter(currentStatus),
          deviceType: "desktop",
        };
      } else if (activityLog?.deviceId && !deviceMap[activityLog.deviceId]) {
        deviceMap[activityLog.deviceId] = {
          name: activityLog.deviceName,
          lastLogin: moment(activityLog.timeOfActivity).format("DD MMM, YY"),
          activityDate: moment(userDetail.updatedAt).format("DD MMM, YY"),
          currentStatus: CommonUtils.capitalizeFirstLetter(currentStatus),
          deviceType: "mobile",
        };
      }
      const info: UserActivityInfo = {
        heading,
        tag:
          activityLog.requestSource === "POS"
            ? `Desktop-${userAgent?.browser?.name ?? "N/A"}`
            : "IDEdge",
        date: moment(activityLog.timeOfActivity).format("DD MMM, YY"),
        time: moment(activityLog.timeOfActivity)
          .add(5, "hours")
          .add(30, "minutes")
          .format("hh:mmA"),
        tagColor: "yellow",
      };
      if (category === activities[activities.length - 1].category) {
        activities[activities.length - 1].info.push(info);
      } else {
        activities.push({
          category,
          info: [info],
        });
      }
    }
    const result: BlacklistUserProfileRes = {
      blacklistedUser: transformedUser,
      userActivity: activities,
      devices: Object.values(deviceMap),
    };

    return result;
  }
}

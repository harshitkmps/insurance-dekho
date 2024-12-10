import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { CityDataDTO } from "../dtos/response/city-data";
import CommonApiHelper from "./helpers/common-api-helper";
import { ChannelPartner } from "../interfaces/cps/channel-partner-response.interface";
import ConfigService from "./config-service";
import { config } from "../constants/config.constants";
import { UseCache } from "../decorators/use-cache.decorator";
import EncryptionService from "./encryption-service";

import {
  primaryContactSupportCount,
  totalContactPoints,
} from "../constants/agent-profile.constants";
import { CityResponse } from "../interfaces/sfa/city-response.interface";
import CommonUtils from "../utils/common-utils";
import { DealerHierarchyCheckResult } from "../interfaces/cps/hierarchy-valid-response.interface";
import { GetDealerByUuidQuery } from "../dtos/sfa/get-dealer-by-uuid.dto";
import ContextHelper from "./helpers/context-helper";
import PartnerConnectService from "./partner-connect-service";

@Injectable()
export default class DealerService {
  constructor(
    private apiHelper: CommonApiHelper,
    private configService: ConfigService,
    private encryptionService: EncryptionService,
    private partnerConnectService: PartnerConnectService
  ) {}

  public async getDealers(filters: Object): Promise<any> {
    Logger.debug("fetching dealers with filters ", filters);
    try {
      filters["status"] = 1;
      const options = {
        endpoint: process.env.CHANNEL_PARTNER_SERVICE_ENDPOINT_V2,
      };
      const cpsResponseData: any = await this.apiHelper.fetchData(
        options,
        filters
      );
      if (filters["getCitiesByReportingManager"] === "true") {
        const cityArray = new Array<CityDataDTO>();
        if (cpsResponseData && cpsResponseData.data) {
          cpsResponseData.data.data.forEach((x) => {
            const cityData = {
              central_city_name: x.name,
              central_city_id: x.city_id,
            };
            cityArray.push(cityData);
          });
        }
        cpsResponseData.data.data = cityArray;
      }
      return cpsResponseData.data;
    } catch (error) {
      const data = [];
      return data;
    }
  }

  public async getDealersV2(filters: Object): Promise<any> {
    Logger.debug("fetching dealers v2 with filters ", filters);
    try {
      const options = {
        endpoint: process.env.CHANNEL_PARTNER_SERVICE_ENDPOINT_V2,
      };
      const cpsResponseData: any = await this.apiHelper.fetchData(
        options,
        filters
      );
      return cpsResponseData.data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  public async getCityByDealer(params: Object): Promise<any> {
    Logger.debug("fetching cities list with params ", params);
    try {
      const options = {
        endpoint: process.env.SFA_CITY_DATA_ENDPOINT,
      };
      const cityResponse: CityResponse = await this.apiHelper.fetchData(
        options,
        params
      );
      const cityArray = new Array<CityDataDTO>();
      if (cityResponse && cityResponse.data) {
        cityResponse.data.forEach((x) => {
          const cityData = {
            central_city_name: x.cityName,
            central_city_id: x.cityId,
          };
          cityArray.push(cityData);
        });
      }
      return {
        data: cityArray,
      };
    } catch (error) {
      const data = [];
      return data;
    }
  }

  public async getDealerDetails(params: Object): Promise<any> {
    try {
      params["status"] = 1;
      const options = {
        endpoint: process.env.CHANNEL_PARTNER_SERVICE_ENDPOINT,
      };
      const cpsResponseData: ChannelPartner = await this.apiHelper.fetchData(
        options,
        params
      );
      Logger.debug("get dealer details response ", { params });
      if (!cpsResponseData.data?.length) {
        Logger.debug("empty cps repsonse");
      } else if (!cpsResponseData.data[0]?.status) {
        Logger.debug("inactive channel partner");
        return [];
      }
      return cpsResponseData.data;
    } catch (error) {
      Logger.error("error in get dealer details API", error);
      const data = [];
      return data;
    }
  }

  public async getDealerDetailsV2(params: object): Promise<any> {
    try {
      params["status"] = 1;
      const options = {
        endpoint: process.env.CHANNEL_PARTNER_SERVICE_ENDPOINT_V2,
      };
      const cpsResponseData: ChannelPartner = await this.apiHelper.fetchData(
        options,
        params
      );
      Logger.debug("get dealer details response ", { params });
      if (!cpsResponseData.data?.length) {
        Logger.debug("empty cps repsonse");
      } else if (!cpsResponseData.data[0]?.status) {
        Logger.debug("inactive channel partner");
        return [];
      }
      return cpsResponseData.data;
    } catch (error) {
      Logger.error("error in get dealer details API", error);
      const data = [];
      return data;
    }
  }

  public async fetchContactInfo(params: any): Promise<any> {
    try {
      const request = {
        dealerId: params.dealerId,
        getAgentMapping: true,
        medium: params.medium,
      };
      const dealerDetails = await this.getDealerDetails(request);
      Logger.debug("dealer details fetched ", dealerDetails);
      if (
        dealerDetails &&
        dealerDetails[0] &&
        dealerDetails[0].sales_agents &&
        dealerDetails[0].sales_agents.length
      ) {
        const hierarchyData = {};
        for (const salesAgent in dealerDetails[0].sales_agents) {
          const channelPartnerData = dealerDetails[0].sales_agents[salesAgent];
          if (channelPartnerData["designation_slug"] === "business_manager") {
            hierarchyData["bmDetails"] = {
              bm_name: channelPartnerData["name"],
              bm_mobile: channelPartnerData["mobile"],
              bm_email: channelPartnerData["email"],
            };
          }
          if (channelPartnerData["designation_slug"] === "area_manager") {
            hierarchyData["amDetails"] = {
              am_name: channelPartnerData["name"],
              am_email: channelPartnerData["mobile"],
              am_mobile: channelPartnerData["email"],
            };
          }
        }
        hierarchyData["support_email"] = "support@insurancedekho.com";
        return { data: hierarchyData };
      }
      return {};
    } catch (error) {
      Logger.error(error);
      const data = {};
      return data;
    }
  }

  public async fetchContactInfoHeirarchyForAgents(
    params: any,
    userInfo: any
  ): Promise<any> {
    try {
      const request = {
        dealerId: params.dealerId,
        getAgentMapping: true,
        medium: params.medium,
      };
      let isRap = false;
      if (userInfo?.refer_dealer_id) {
        Logger.debug("Fetching contact info for RAP");
        isRap = true;
        const mPosDealerId = userInfo?.refer_dealer_id;
        params.dealerId = mPosDealerId;
        delete request.getAgentMapping;
      }
      const dealerDetails = await this.getDealerDetails(request);
      let supportContacts = isRap
        ? dealerDetails
        : dealerDetails?.[0]?.sales_agents;
      const hierarchyData = {};
      const allHierarchies = [];
      supportContacts = supportContacts || [];
      supportContacts
        .slice(0, totalContactPoints)
        .forEach((supportContact, index) => {
          const currentHierarchyData = {
            name: supportContact["name"],
            email: supportContact["email"],

            designationName: !isRap
              ? supportContact["designation_name"]
              : "Master POS",
            designationSlug: !isRap
              ? supportContact["designation_slug"]
              : "master_pos",
            heirarchyTitle: `L-${index + 1} Support`,
          };
          if (index < primaryContactSupportCount) {
            currentHierarchyData["mobile"] = Number(supportContact["mobile"]);
          }
          allHierarchies.push(currentHierarchyData);
        });
      // if (!isRap) {
      //   allHierarchies.pop();
      // }
      hierarchyData["hierarchy"] = allHierarchies;
      hierarchyData["support_email"] = "support@insurancedekho.com";
      return hierarchyData;
    } catch (error) {
      Logger.error(error);
      const data = {};
      return data;
    }
  }

  @UseCache({ expiryTimer: 3600 })
  public async fetchTeamDetails(teamUuid: any): Promise<any> {
    try {
      const options = {
        endpoint: process.env.API_POS_ENDPOINT + "/v1/team-info",
      };
      const params = {
        teamUuid,
      };
      const teamDetails: any = await this.apiHelper.fetchData(options, params);
      return teamDetails;
    } catch (error) {
      Logger.error(
        `Error while fetching team details for team ${teamUuid}`,
        error
      );
    }
  }

  public async fetchProductWiseTeamConfig(teamRmMapping: any): Promise<any> {
    try {
      const productWiseTeamConfig = {};
      const teamDetailsPromises = teamRmMapping.map(async (team) => {
        const teamUuid = team["team_uuid"];
        return this.fetchTeamDetails(teamUuid);
      });
      const teamDetails = await Promise.all(teamDetailsPromises);
      const productTypeMapping = await this.configService.getConfigValueByKey(
        config.BROKERAGE_PRODUCT_TYPE_MAPPING
      );

      teamDetails.forEach((team: any) => {
        const products = team?.data?.sub_products;

        products.forEach((subProduct) => {
          const subProductId = subProduct?.product_type_id;
          const mappedLobToSubProduct = productTypeMapping[subProductId];
          if (mappedLobToSubProduct) {
            productWiseTeamConfig[mappedLobToSubProduct] = team?.data?.["uuid"];
          }
        });
      });
      return productWiseTeamConfig;
    } catch (error) {
      Logger.error("Error while fetching product wise team mapping", { error });
      throw error;
    }
  }

  public async fetchContactInfoHeirarchyForAgentsV2(
    params: any,
    userInfo: any
  ): Promise<any> {
    try {
      const request = {
        dealerId: params.dealerId,
        getAgentMapping: true,
        medium: params.medium,
      };
      let isRap = false;

      if (userInfo?.refer_dealer_id) {
        isRap = true;
        const mPosDealerId = userInfo?.refer_dealer_id;
        request.dealerId = mPosDealerId;
        delete request.getAgentMapping;
      }
      const dealerDetails = await this.getDealerDetailsV2(request);
      const teamRmMapping = dealerDetails?.[0]?.team_rm_mapping;
      const productWiseTeamConfig = await this.fetchProductWiseTeamConfig(
        teamRmMapping
      );

      const response = {};
      const supportContacts = isRap
        ? dealerDetails
        : dealerDetails?.[0]?.sales_agents;

      const productWiseHeirarchiesPromises = Object.entries(
        productWiseTeamConfig
      ).map(async ([product, teamUuid]) => {
        const productWiseHeirarchies = [];
        const supportContactsTeamWise =
          supportContacts?.[teamUuid as string] || [];

        const supportContactPromises = supportContactsTeamWise
          .slice(0, totalContactPoints)
          .map(async (supportContact, index) => {
            const encryptedMobile = supportContact["mobile"];
            const encryptedEmail = supportContact["email"];
            const encryptedData = [encryptedMobile, encryptedEmail];

            const decryptionResponse = await this.encryptionService.decrypt(
              encryptedData
            );

            if (decryptionResponse) {
              supportContact["mobile"] =
                decryptionResponse?.data?.[encryptedMobile]?.decrypted;
              supportContact["email"] =
                decryptionResponse?.data?.[encryptedEmail]?.decrypted;
            }

            const currentHierarchyData = {
              name: supportContact["name"],
              email: supportContact["email"],
              designationName: !isRap
                ? supportContact["designation_name"]
                : "Master POS",
              designationSlug: !isRap
                ? supportContact["designation_slug"]
                : "master_pos",
              heirarchyTitle: `L-${index + 1} Support`,
            };

            if (index < primaryContactSupportCount) {
              currentHierarchyData["mobile"] = supportContact["mobile"];
            }

            productWiseHeirarchies.push(currentHierarchyData);
          });

        await Promise.all(supportContactPromises);
        productWiseHeirarchies.sort((a, b) => {
          return a.heirarchyTitle.localeCompare(b.heirarchyTitle);
        });

        return [product, productWiseHeirarchies];
      });

      const resolvedProductWiseHeirarchies = await Promise.all(
        productWiseHeirarchiesPromises
      );

      const heirarchy = Object.fromEntries(resolvedProductWiseHeirarchies);

      response["hierarchy"] = heirarchy;
      response["support_email"] = "support@insurancedekho.com";
      return response;
    } catch (error) {
      const rawError = CommonUtils.isJsonString(error);
      Logger.error("error while fetching support contacts team wise", {
        error: rawError,
      });
      return {};
    }
  }

  @UseCache({ expiryTimer: 3600 })
  public async getAgentChildDetails(
    dealerId: string,
    limit: number
  ): Promise<any> {
    const params = {
      referrer_id: dealerId,
      projection: "id,name,mobile,email,gcd_code,dealer_id",
      limit,
    };
    const response = await this.getDealerDetails(params);
    return response;
  }

  @UseCache({ expiryTimer: 1800 }) // 30 min
  public async isSfaInDealerHierarchy(
    salesUuid: string,
    dealerUuid: string,
    teamUuid: string
  ): Promise<DealerHierarchyCheckResult> {
    const result = {
      isUserInHierarchy: false,
      cpsUser: null,
    };
    const cpsDetails = await this.getDealerDetailsV2({
      iam_uuid: dealerUuid,
      getAgentMapping: true,
    });

    if (!cpsDetails?.length) {
      throw new NotFoundException("Given user not found in the system");
    }

    const salesHierarchyList = cpsDetails[0].sales_agents?.[teamUuid] ?? [];
    result.cpsUser = cpsDetails[0];
    for (const salesUser of salesHierarchyList) {
      if (salesUser.iam_uuid === salesUuid) {
        result.isUserInHierarchy = true;
        break;
      }
    }

    return result;
  }

  public async getDealerByUuid(query: GetDealerByUuidQuery): Promise<any> {
    const store = await ContextHelper.getStore();
    const cpsUser = store.get("cpsUser");

    const transformedUser: any = {
      name: cpsUser.name,
      iamUuid: cpsUser.iam_uuid,
      gcdCode: cpsUser.gcd_code,
      mobile: cpsUser.mobile,
      email: cpsUser.email,
      mobileMasked: cpsUser.masked_mobile,
      emailMasked: cpsUser.masked_email,
      teamRmMapping: cpsUser.team_rm_mapping,
    };

    if (query.getDecryptedMobileEmail) {
      const usersWithDecryptedPii =
        await this.partnerConnectService.prepareData([cpsUser]);
      transformedUser.decryptedMobile = usersWithDecryptedPii[0].mobile;
      transformedUser.decryptedEmail = usersWithDecryptedPii[0].email;
    }

    return transformedUser;
  }
}

import { HttpException, Injectable, Logger, HttpStatus } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import { Roles } from "../constants/roles.constants";
import { VehicleTypes } from "../constants/case-listing.constants";
import {
  ChannelPartnerSubTypes,
  ChannelPartnerTypes,
} from "../constants/channel-partners.constants";
import ConfigService from "./config-service";
import { config } from "../constants/config.constants";
import DealerService from "./dealer-service";
import DateTimeUtils from "../utils/date-time-utils";
import SalesService from "./sales-service";
import ContextHelper from "./helpers/context-helper";

@Injectable()
export default class GridPointService {
  constructor(
    private apiHelper: CommonApiHelper,
    private configService: ConfigService,
    private dealerService: DealerService,
    private salesService: SalesService
  ) {}

  public async getGridPointsData(params: any, userInfo: any): Promise<any> {
    try {
      const { isAdminOrSalesUser, channelType, channelSubType } =
        this.getChannelDetails(userInfo, ChannelPartnerSubTypes.RETAIL);
      const {
        offset = 0,
        limit = 10,
        vehicleType,
        fuelType,
        insurerIds,
        rtoIds,
        productType,
        startDate,
        endDate,
        policyType,
        vehicleSubType,
        makeId,
        modelId,
        gvw,
        dealerGcdCode,
        showHistoricData,
      } = params;

      const gridPointsParams: any = {
        channelTypeId: channelType,
        channelSubTypeId: channelSubType,
        startDate: DateTimeUtils.formatDateToUTC(startDate),
        endDate: DateTimeUtils.formatDateToUTC(endDate, true),
        vehicleType,
        insurerIds,
        policyType,
        vehicleSubType: String(vehicleSubType),
        showHistoricData,
      };
      if (
        vehicleType === VehicleTypes.GCV ||
        vehicleType === VehicleTypes.PCV ||
        vehicleType === VehicleTypes.Misc
      ) {
        gridPointsParams.makeHierarchy = makeId ?? "";
        if (modelId) {
          gridPointsParams.modelHierarchy = modelId ?? "";
        }
      }
      if (
        vehicleType === VehicleTypes.Car ||
        vehicleType === VehicleTypes.Bike
      ) {
        gridPointsParams.fuelType = fuelType ?? "";
      }
      if (vehicleType === VehicleTypes.GCV) {
        gridPointsParams.grossWeight = gvw ?? "";
      }
      if (!isAdminOrSalesUser) {
        gridPointsParams.gcdCode = userInfo.gcd_code;
      }
      gridPointsParams.rtoCode = [`${rtoIds}`];
      gridPointsParams.isDownload = false;
      if (dealerGcdCode) {
        await this.fetchAndSetDealerDetails(dealerGcdCode, gridPointsParams);
      }
      if (
        gridPointsParams.channelTypeId !== String(ChannelPartnerTypes["AGENCY"])
      ) {
        delete gridPointsParams.channelSubTypeId;
      }

      const queryParams: any = {
        txnType: "payout",
        domainId: productType,
        start: offset,
        limit: limit,
      };
      const options = {
        endpoint: `${process.env.GRID_IFM_END_POINT}/orchestrate/v1/flow/rules-by-request`,
        config: { params: queryParams },
      };
      Logger.debug("Grid Points Options", options);
      Logger.debug("Grid Points Params", gridPointsParams);
      const res = await this.apiHelper.postData(options, gridPointsParams);
      const gridPointResponseData = res.data.body.data || [];

      if (gridPointResponseData.length > 0) {
        const groupedData = await this.groupByStartDateAndProcessConditions(
          gridPointResponseData
        );
        res.data.body.data = groupedData;
      } else {
        res.data.body.data = [];
      }

      return res?.data;
    } catch (error) {
      Logger.error("error while fetching grid points from IFM", error);
      if (error?.response?.errors) {
        return {
          body: {
            data: [],
          },
        };
      }
      throw new HttpException(
        error?.response ?? "Unable to get grid points",
        error.status
      );
    }
  }

  public getChannelDetails(userInfo: any, defaultSubType: string) {
    const isAdminOrSalesUser = [
      ...Roles.POS_SALES_ALL,
      ...Roles.POS_ADMIN_ALL,
      Roles.POS_EXECUTIVE,
      Roles.POS_FINANCE,
    ]?.includes(userInfo?.pos_role_id);

    const channelType = !isAdminOrSalesUser
      ? String(ChannelPartnerTypes[userInfo.channel_partner_type])
      : String(ChannelPartnerTypes.AGENCY);

    const channelSubType = !isAdminOrSalesUser
      ? userInfo.channel_partner_sub_type
      : defaultSubType;

    return { isAdminOrSalesUser, channelType, channelSubType };
  }

  public async groupByStartDateAndProcessConditions(
    data: any[]
  ): Promise<any[]> {
    const grouped = [];
    let currentGroup = { startDate: "", endDate: "", items: [] };

    data.forEach((item) => {
      const startDate = DateTimeUtils.formatDateToDDMMMYYYY(item.startDate);
      const processedItem = this.processConditionalAttributes(item);
      const endDate = item?.endDate
        ? DateTimeUtils.formatDateToDDMMMYYYY(item.endDate)
        : "";

      if (
        currentGroup.startDate !== startDate ||
        currentGroup?.endDate !== endDate
      ) {
        if (currentGroup.items.length > 0) {
          grouped.push(currentGroup);
        }
        currentGroup = { startDate, endDate, items: [] };
      }
      currentGroup.items.push(processedItem);
    });

    if (currentGroup.items.length > 0) {
      grouped.push(currentGroup);
    }

    return grouped;
  }

  private processConditionalAttributes(item: any): any {
    if (item.conditionalAttributeMap.caseType) {
      item.caseTypeProcessed = this.formatAttributeValues(
        item.conditionalAttributeMap.caseType
      );
      delete item.conditionalAttributeMap.caseType;
    }
    if (item.conditionalAttributeMap.insurer) {
      item.insurerTypeProcessed = this.formatAttributeValues(
        item.conditionalAttributeMap.insurer
      );
      delete item.conditionalAttributeMap.insurer;
    }
    return item;
  }

  private formatAttributeValues(attribute: any): string {
    const operatorMap = {
      eq: ", ",
      range: " - ",
    };
    const separator = operatorMap[attribute.operator] || ", ";
    return attribute.attributeValues.join(separator);
  }

  private async fetchAndSetDealerDetails(
    dealerGcdCode: string,
    gridParams: any
  ) {
    try {
      const params = { gcd_code: dealerGcdCode };
      const dealerDetails = await this.dealerService.getDealerDetails(params);
      const dealerData = dealerDetails?.data?.[0];
      if (dealerData) {
        gridParams.channelTypeId = String(
          ChannelPartnerTypes[dealerData?.channel_partner_type ?? ""]
        );
        gridParams.channelSubTypeId =
          dealerData?.channel_partner_sub_type ?? "";
      }
      gridParams.gcdCode = dealerGcdCode;
    } catch (error) {
      Logger.error("Error fetching dealer details:", error);
    }
  }

  public async checkGridPointOrDownloadGridVisible(
    userInfo: any
  ): Promise<any> {
    const gridVisibility = await this.configService.getConfigValueByKey(
      config.GRID_VISIBILITY
    );

    if (!gridVisibility?.grid_points_visibility[userInfo.tenant_id || 1]) {
      return false;
    }

    const isGridEligible = this.checkTenantEligibility(
      gridVisibility?.grid_points_visibility[userInfo.tenant_id || 1],
      userInfo,
      gridVisibility?.grid_points_visibility
    );

    const isDownloadEligible = this.checkTenantEligibility(
      gridVisibility?.grid_download_visibility[userInfo.tenant_id || 1],
      userInfo,
      gridVisibility?.grid_download_visibility
    );

    return { isGridEligible, isDownloadEligible };
  }

  private checkTenantEligibility(
    tenantsUsersEligible: any,
    userInfo: any,
    gridVisibility: any
  ): boolean {
    const enableForAllUuids = gridVisibility.enableForAllUuids;
    const blockedUUids = gridVisibility.blockedUUids || [];
    const enableUuids = gridVisibility.enableUuids || [];

    let isEligibleBySubTypeOrRole = false;

    if (
      !userInfo.refer_dealer_id &&
      tenantsUsersEligible.aggregator &&
      userInfo.channel_partner_sub_type === ChannelPartnerSubTypes.AGGREGATOR
    ) {
      isEligibleBySubTypeOrRole = true;
    } else if (
      !userInfo.refer_dealer_id &&
      tenantsUsersEligible.retail &&
      userInfo.channel_partner_sub_type === ChannelPartnerSubTypes.RETAIL
    ) {
      isEligibleBySubTypeOrRole = true;
    } else if (
      tenantsUsersEligible.masterPos &&
      !userInfo.refer_dealer_id &&
      userInfo.pos_role_id === Roles.POS_AGENT
    ) {
      isEligibleBySubTypeOrRole = true;
    } else if (tenantsUsersEligible.rap && userInfo.refer_dealer_id) {
      isEligibleBySubTypeOrRole = true;
    } else if (
      tenantsUsersEligible.subAgent &&
      userInfo.pos_role_id === Roles.POS_SUB_AGENT
    ) {
      isEligibleBySubTypeOrRole = true;
    }

    const isRoleMatch = tenantsUsersEligible?.isRole?.includes(
      userInfo?.pos_role_id
    );
    const isEligible = isEligibleBySubTypeOrRole || isRoleMatch;

    if (!isEligible) {
      return false;
    }

    if (blockedUUids.includes(userInfo?.uuid)) {
      return false;
    }

    if (enableForAllUuids) {
      return true;
    }

    if (!enableUuids.includes(userInfo?.uuid)) {
      return false;
    }
    return true;
  }

  public async getGridPointRtoList(): Promise<any> {
    const options = {
      endpoint: process.env.GRID_IFM_END_POINT + `/ccs/master/v1/rto-code`,
    };
    Logger.debug("grid rto list", { options });
    const gridRtoList: any = await this.apiHelper.fetchData(options, {});
    return gridRtoList?.data?.body;
  }
  public async getGridFuelTypeList(): Promise<any> {
    const options = {
      endpoint: process.env.GRID_IFM_END_POINT + `/ccs/master/v1/fuel-type`,
    };
    Logger.debug("grid fuel type list", { options });
    const fuelTypeList: any = await this.apiHelper.fetchData(options, {});
    return fuelTypeList?.data?.body;
  }
  public async getGridInsurerTypeList(): Promise<any> {
    const options = {
      endpoint:
        process.env.GRID_IFM_END_POINT +
        `/ccs/master/v1/insurer-motor-with-short-name`,
    };
    Logger.debug("grid insurer type list", { options });
    const insurerTypeList: any = await this.apiHelper.fetchData(options, {});
    return insurerTypeList?.data?.body;
  }
  public async getGridPolicyTypeList(): Promise<any> {
    const options = {
      endpoint: process.env.GRID_IFM_END_POINT + `/ccs/master/v1/policy-type`,
    };
    Logger.debug("grid policy type list", { options });
    const policyTypeList: any = await this.apiHelper.fetchData(options, {});
    return policyTypeList?.data?.body;
  }
  public async getGridvehicleTypeList(): Promise<any> {
    const options = {
      endpoint: process.env.GRID_IFM_END_POINT + `/ccs/master/v1/vehicle-type`,
    };
    Logger.debug("grid vehicle type list", { options });
    const vehicleTypeList: any = await this.apiHelper.fetchData(options, {});
    const modifiedList = vehicleTypeList?.data?.body
      ?.filter(
        (item: any) => item.value === "Bike" || item.value === "Private Car"
      )
      ?.map((item: any) => {
        if (item.value === "Bike") {
          return { ...item, value: "2 - Wheeler" };
        }
        return item;
      });

    return modifiedList;
  }
  public async getDependentFieldsList(
    vehicleType: string,
    insurer: string,
    vehicleSubType?: string
  ): Promise<any> {
    const queryParams: any = {
      domainId: "motor",
      fieldName: vehicleSubType ? "makeHierarchy" : "vehicleSubType",
      vehicleType: vehicleType,
      insurer: insurer,
    };

    if (vehicleSubType) {
      queryParams.vehicleSubType = vehicleSubType;
    }

    const options = {
      endpoint: `${process.env.GRID_IFM_END_POINT}/view/v1/dependent-fields`,
      config: { params: queryParams },
    };
    const dataList: any = await this.apiHelper.fetchData(options, {});
    return dataList?.data?.body;
  }

  public async getModelList(
    vehicleType: string,
    vehicleSubType: string,
    makeHierarchy: string,
    insurer: string
  ): Promise<any> {
    const queryParams: any = {
      domainId: "motor",
      txnType: "payout",
      fieldName: "modelHierarchy",
      vehicleType: vehicleType,
      vehicleSubType: vehicleSubType,
      makeHierarchy: makeHierarchy,
      insurer: insurer,
    };
    const options = {
      endpoint: `${process.env.GRID_IFM_END_POINT}/view/v1/dependent-fields/flow-id/rule`,
      config: { params: queryParams },
    };
    const modelList: any = await this.apiHelper.fetchData(options, {});
    return modelList?.data?.body;
  }

  public async getTeamWiseProductMapping(
    teamRmMapping: { team_uuid: string }[]
  ): Promise<{ team_uuid: string; productIds: number[] }[]> {
    try {
      if (teamRmMapping?.length === 0) {
        throw new HttpException(
          "No Team RM Mapping Found!",
          HttpStatus.NOT_FOUND
        );
      }

      const teamDetailsPromises = teamRmMapping.map(({ team_uuid }) => {
        return this.salesService.fetchTeamDetails(team_uuid).catch((error) => {
          Logger.error(
            `Error fetching details for team_uuid: ${team_uuid}`,
            error
          );
          return [];
        });
      });

      const teamDetailsResponses = await Promise.all(teamDetailsPromises);

      const result = teamDetailsResponses.map((teamDetails, index) => {
        const productTypeIds = new Set<number>();

        teamDetails?.forEach((teamDetail: any) => {
          teamDetail?.sub_products?.forEach((product: any) => {
            productTypeIds.add(product.product_type_id);
          });
        });

        return {
          team_uuid: teamRmMapping[index].team_uuid,
          productIds: Array.from(productTypeIds), // Convert Set to Array
        };
      });

      return result;
    } catch (error) {
      Logger.error("Error while fetching team-wise product mapping", error);
      throw new HttpException(
        "No Team RM Mapping Found!",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private findReportingManagerUuid(
    teamUuid: string,
    teamRmMapping: any
  ): string | null {
    const record = teamRmMapping.find(
      (record: any) => record.team_uuid === teamUuid
    );
    return record ? record.reporting_manager_uuid : null;
  }

  public async getZonesForSales(
    teamUuid: string,
    projection: string,
    userInfo: any
  ): Promise<any> {
    let iamUuid = userInfo?.uuid;
    if (teamUuid) {
      iamUuid =
        this.findReportingManagerUuid(teamUuid, userInfo?.team_rm_mapping) ||
        "";
    }
    const queryParams: any = {
      iam_uuid: iamUuid,
      projection,
    };
    const salesUserData: any = await this.salesService.getSfaUsers(queryParams);
    return salesUserData?.data;
  }

  public async downloadGridPoints(params: any, userInfo: any): Promise<any> {
    try {
      const { isAdminOrSalesUser, channelType, channelSubType } =
        this.getChannelDetails(userInfo, ChannelPartnerSubTypes.AGGREGATOR);
      const {
        // zoneId,
        startDate,
        endDate,
        stateId,
        productType,
        vehicleType,
        dealerGcdCode,
        insurerIds,
      } = params;

      const downloadGridParams: any = {
        filters: {
          channelTypeId: channelType,
          channelSubTypeId: channelSubType,
          startDate: DateTimeUtils.formatDateToUTC(startDate),
          endDate: DateTimeUtils.formatDateToUTC(endDate, true),
          // zoneId,
          stateId,
          isDownload: true,
          vehicleType,
          insurerIds,
        },
        requestSource: "GRIDPOINT",
      };
      if (!isAdminOrSalesUser) {
        downloadGridParams.gcdCode = userInfo.gcd_code;
      }
      if (dealerGcdCode) {
        await this.fetchAndSetDealerDetails(dealerGcdCode, downloadGridParams);
      }
      if (
        downloadGridParams.filters.channelTypeId !==
        String(ChannelPartnerTypes.AGENCY)
      ) {
        delete downloadGridParams.filters.channelSubTypeId;
      }

      const queryParams: any = {
        triggerDownload: true,
        domainId: productType,
      };
      const options = {
        endpoint: `${process.env.GRID_IFM_END_POINT}/orchestrate/v1/flow/grid-download`,
        config: {
          params: queryParams,
          headers: {
            Authorization: ContextHelper.getStore().get("authorization"),
          },
        },
      };
      Logger.debug("Grid Download Options", options);
      Logger.debug("Grid Download Params", downloadGridParams);
      const res = await this.apiHelper.postData(options, downloadGridParams);
      return res?.data;
    } catch (error) {
      Logger.error("error while downloading grid points from IFM", error);
      throw new HttpException(
        error?.response ?? "Unable to download grid",
        error.status
      );
    }
  }
}

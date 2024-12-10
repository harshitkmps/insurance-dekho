import { config } from "../constants/config.constants";
import {
  mapRolesForPartnerListing,
  PartnerListingProjections,
  PartnerListingProjectionsForRenewal,
} from "../constants/partner-listing.constants";
import { PosRoles } from "../constants/pos-roles.constants";
import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import ConfigService from "./config-service";
import { UseCache } from "../decorators/use-cache.decorator";
import CommonApiHelper from "./helpers/common-api-helper";
import CaseListingService from "./case-listing-v2-service";
import DashboardService from "./dashboard-service";
import {
  PARTNER_BASE_LIST_PROJECTIONS,
  PARTNER_COHORT_WISE_PROJECTION,
} from "../constants/dashboard.constants";
import { PartnerCohortProjectionConfig } from "../interfaces/melorra-scrapper/partner-base-dealers.interface";

@Injectable()
export default class PartnerListingService {
  constructor(
    private configService: ConfigService,
    private apiHelper: CommonApiHelper,
    private caseListingService: CaseListingService,
    @Inject(forwardRef(() => DashboardService))
    private dashboardService: DashboardService
  ) {}

  public async getPartnerListingConfig(
    userInfo: any,
    requestOrigin: any
  ): Promise<any> {
    userInfo.tenant_id = userInfo.tenant_id || 1;
    const configData = {
      partnerListingEnabled: false,
      filters: [],
      tableHeaders: [],
      renewalTableHeaders: [],
      dashboardV2Enabled: false,
    };

    const partnerListingConfig = await this.configService.getConfigValueByKey(
      config.PARTNER_LISTING_CONFIG
    );

    if (userInfo?.tenant_id === 0 || userInfo?.tenant_id === null) {
      userInfo.tenant_id = 1;
    }

    const [partnerListingEnabled, filters, dashboardV2] = [
      partnerListingConfig?.enabled &&
        this.configService.checkConditions(
          partnerListingConfig.conditions,
          userInfo
        ),
      this.configService.checkConfigArrOfConditions(
        partnerListingConfig?.filters,
        userInfo,
        requestOrigin
      ),
      partnerListingConfig?.dashboardV2?.enabled &&
        this.configService.checkConditions(
          partnerListingConfig.dashboardV2.conditions,
          userInfo
        ),
    ];

    configData.partnerListingEnabled = partnerListingEnabled;
    configData.tableHeaders = partnerListingConfig.table_headers;
    configData.renewalTableHeaders = partnerListingConfig.renewal_table_headers;
    configData.filters = filters;
    configData.dashboardV2Enabled = dashboardV2;

    return { config: configData };
  }

  @UseCache({ useObjectAsKey: true, expiryTimer: 120 })
  public async fetchPartnerData(
    filters: any,
    limit: number,
    offset: number,
    isRenewalDashboard: boolean,
    projections: any
  ): Promise<any> {
    const options = {
      endpoint: process.env.API_CENTRAL_URL + `/v2/pos/aggregates/dealers`,
    };
    const reqeBody = {
      filters,
      limit,
      offset,
      isRenewalDashboard,
      projections,
    };

    Logger.log("get dealers request", reqeBody);
    const data = await this.apiHelper.postData(options, reqeBody);
    return data;
  }

  public selectPartnerListingProjections(
    userTeamDetails: any,
    cohortName?: string,
    isDownload?: boolean
  ): string[] {
    const selectedProjections = [...PARTNER_BASE_LIST_PROJECTIONS.common];
    if (isDownload) {
      selectedProjections.push(...PARTNER_BASE_LIST_PROJECTIONS.downloadOnly);
    }
    if (cohortName) {
      const cohortConfig: PartnerCohortProjectionConfig =
        PARTNER_COHORT_WISE_PROJECTION[cohortName];
      const cohortProjections = cohortConfig.projections ?? [];
      selectedProjections.push(...cohortProjections);
      if (!cohortConfig.allowLobWise) {
        // lob wise projections not required
        return selectedProjections;
      }
    }

    const lowerCasedProducts = userTeamDetails?.lobs.map((product: string) =>
      product.toLowerCase()
    );
    for (const lob in PARTNER_BASE_LIST_PROJECTIONS) {
      if (lowerCasedProducts.includes(lob)) {
        selectedProjections.push(...PARTNER_BASE_LIST_PROJECTIONS[lob]);
      }
    }

    return selectedProjections;
  }

  public async getPartnerListingData(
    userInfo: any,
    reqBody: any
  ): Promise<any> {
    userInfo.tenant_id = userInfo.tenant_id || 1;
    let userTeamDetails = {};

    if (reqBody?.teamUuid) {
      userTeamDetails = await this.dashboardService.getAllLobs(
        userInfo?.teams,
        reqBody?.teamUuid,
        reqBody?.uuid,
        userInfo.pos_role_id
      );
    }
    const requestBody = {};
    const isRenewalDashboard = reqBody["isRenewalDashboard"];
    requestBody["filters"] = {};
    requestBody["filters"]["start_date"] =
      reqBody["filters"]["dateRange"]["startDate"];
    requestBody["filters"]["end_date"] =
      reqBody["filters"]["dateRange"]["endDate"];
    requestBody["filters"]["is_hierarchy"] = reqBody["isFetchHierarchy"];
    requestBody["offset"] = reqBody["offset"];
    requestBody["limit"] = reqBody["limit"];
    requestBody["isRenewalDashboard"] = isRenewalDashboard;
    requestBody["projections"] = isRenewalDashboard
      ? PartnerListingProjectionsForRenewal
      : reqBody.teamUuid
      ? this.selectPartnerListingProjections(userTeamDetails)
      : PartnerListingProjections;
    if (isRenewalDashboard) {
      requestBody["filters"]["sort"] = -1;
      requestBody["filters"]["order_by"] = "motor_nop_renewed";
    }

    if (userInfo?.tenant_id === 0 || userInfo?.tenant_id === null) {
      userInfo.tenant_id = 1;
    }
    Logger.debug("logged in user info for partner listing", userInfo);

    if (reqBody.isFetchHierarchy) {
      if (!reqBody["filters"]["role"]) {
        // take role from logged in user sales or dealer
        const roleId =
          reqBody["filters"]["pos_role_id"] || userInfo?.pos_role_id;
        // fetch role based on this role id
        requestBody["filters"]["role"] = mapRolesForPartnerListing[roleId];
        requestBody["filters"]["iam_uuid"] =
          reqBody["filters"]["iam_uuid"] || userInfo?.uuid;
      } else {
        // role passed from fe
        requestBody["filters"]["role"] = reqBody["filters"]["role"];
        requestBody["filters"]["iam_uuid"] =
          reqBody["filters"]["iam_uuid"] || userInfo?.uuid;
      }
      if (
        userInfo?.pos_role_id === PosRoles.SuperAdmin ||
        userInfo?.pos_role_id === PosRoles.Admin
      ) {
        delete requestBody["filters"]["role"];
        delete requestBody["filters"]["iam_uuid"];
      }
      if (
        typeof reqBody["filters"]["isActive"] !== "undefined" &&
        reqBody["filters"]["isActive"] !== "All"
      ) {
        requestBody["filters"]["is_active"] = reqBody["filters"]["isActive"];
        delete requestBody["filters"]["is_hierarchy"];
        if (reqBody?.lob !== "All" && !reqBody?.dropOffValue) {
          requestBody["filters"]["is_active_lob"] = reqBody?.lob;
        }
      }
    } else {
      requestBody["filters"]["iam_uuid"] =
        reqBody["filters"]["iam_uuid"] || userInfo?.uuid;
      requestBody["filters"]["role"] =
        reqBody["filters"]["role"] || userInfo?.pos_role_id;
      // 2 cases Sales person or dealer data fetched
      if (reqBody["filters"]["designation"] || reqBody["filters"]["role_id"]) {
        const designationId = reqBody["filters"]["role_id"]
          ? reqBody["filters"]["role_id"]
          : reqBody["filters"]["designation"];
        const userRoles = await this.caseListingService.getPosRoles();
        let user = null;
        user = reqBody["filters"]["role_id"]
          ? userRoles.find((user: any) => user.id === designationId)
          : userRoles.find(
              (user: any) =>
                parseInt(user.designationId) === parseInt(designationId)
            );
        let role = user?.name;
        if (role === "RH") {
          role = "SH";
        }
        requestBody["filters"]["role"] = role;
      }
    }

    if (reqBody?.lob && reqBody?.dropOffValue) {
      requestBody["filters"]["drop_off_lob"] = reqBody?.lob;
      requestBody["filters"]["drop_off_duration"] = reqBody?.dropOffValue;
      requestBody["filters"]["current_date"] =
        reqBody["filters"]["dateRange"]["endDate"];

      delete requestBody["filters"]["start_date"];
      delete requestBody["filters"]["end_date"];
      delete requestBody["filters"]["is_active"];
    }

    if (reqBody?.isPmtd) {
      requestBody["filters"]["is_pmtd_data"] = reqBody?.isPmtd;
    }

    if (reqBody?.uuid && reqBody?.designationId) {
      requestBody["filters"]["iam_uuid"] =
        reqBody["filters"]["iam_uuid"] || reqBody?.uuid;
      const designationId = reqBody?.designationId;
      const userRoles = await this.caseListingService.getPosRoles();
      let user = null;
      user = userRoles.find(
        (user: any) => parseInt(user.designationId) === parseInt(designationId)
      );
      let role = user?.name;
      if (role === "RH") {
        role = "SH";
      }
      requestBody["filters"]["role"] = reqBody["filters"]["role"] || role;
    }

    if (reqBody?.teamUuid) {
      requestBody["filters"]["team_uuid"] = reqBody?.teamUuid;
      requestBody["filters"]["level_id"] = userTeamDetails["level"];
      requestBody["filters"]["sales_iam_uuid"] = reqBody?.uuid
        ? reqBody.uuid
        : userInfo["uuid"];
      delete requestBody["filters"]["iam_uuid"];
      delete requestBody["filters"]["role"];
      delete requestBody["filters"]["is_hierarchy"];
      if (reqBody?.filters?.iam_uuid) {
        requestBody["filters"]["dealer_iam_uuid"] = reqBody?.filters?.iam_uuid;
        delete requestBody["filters"]["sales_iam_uuid"];
        delete requestBody["filters"]["team_uuid"];
        delete requestBody["filters"]["level_id"];
      }
    }
    Logger.debug(
      "fetching information for partner listing with request",
      requestBody
    );
    const res = await this.fetchPartnerData(
      requestBody["filters"],
      requestBody["limit"],
      requestBody["offset"],
      requestBody["isRenewalDashboard"],
      requestBody["projections"]
    );

    const hierarchyData = res?.data?.hierarchy_data
      ? res?.data?.hierarchy_data
      : [];

    if (res?.data?.user_data?.length) {
      // converting to integer
      for (const user of res.data.user_data) {
        const userStatEntries = Object.entries(user);
        for (const statEntry of userStatEntries) {
          if (PARTNER_BASE_LIST_PROJECTIONS.common.includes(statEntry[0])) {
            continue;
          }
          user[statEntry[0]] = parseInt(statEntry[1] as string);
        }
      }
    }
    const finalHierarchyData = [];
    hierarchyData.forEach((data) => {
      const finalHierarchyObject = {};
      requestBody["projections"].forEach((projection) => {
        if (data[projection] !== undefined) {
          finalHierarchyObject[projection] = data[projection];
        }
        if (reqBody?.isPmtd) {
          const pmtdProjection = projection + "_pmtd";
          if (data[pmtdProjection] !== undefined) {
            finalHierarchyObject[pmtdProjection] = data[pmtdProjection];
          }
        }
      });
      finalHierarchyData.push(finalHierarchyObject);
    });

    res.data.hierarchy_data = finalHierarchyData;

    res["isFetchHierarchy"] = reqBody?.isFetchHierarchy;
    return res;
  }
}

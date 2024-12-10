import { Injectable, Logger, HttpException } from "@nestjs/common";
import CommonApiHelper from "./helpers/common-api-helper";
import { designationIdVsRole } from "../constants/master-data.constants";
import { AxiosResponse } from "axios";
import { SfaHierarchyCheckResponse } from "../interfaces/sfa/hierarchy-valid-response.interface";
import { UseCache } from "../decorators/use-cache.decorator";

@Injectable()
export default class SalesService {
  constructor(private apiHelper: CommonApiHelper) {}

  public async getSalesPersonList(filters: Object): Promise<any> {
    Logger.debug("fetching sales person list with filters ", filters);
    try {
      const options = {
        endpoint: process.env.SFA_ENDPOINT + "/v2/users/get",
      };
      const salesPersonResponseData: any = await this.apiHelper.fetchData(
        options,
        filters
      );
      if (salesPersonResponseData.data?.data?.length) {
        salesPersonResponseData.data.data.forEach((user: any) => {
          user["label"] =
            (user?.name ? user?.name.trim() : "") +
            " " +
            designationIdVsRole[user?.designation_id] +
            " " +
            user?.employee_id;
          user["value"] = user?.iam_uuid;
        });
      }
      return salesPersonResponseData.data;
    } catch (error) {
      const data = [];
      return data;
    }
  }

  public prepareFetchSfaUsersParams(query: any) {
    const params: any = {};
    if (query.limit) {
      params.limit = query.limit;
    }
    if (query.designationId) {
      params.designation_id = query.designationId;
    }

    if (query.teamUuids) {
      params.team_uuids = query.teamUuids;
    }

    return params;
  }

  public async getSfaUsers(filters: any): Promise<any> {
    Logger.debug("Getting sfa users with filters", { filters });
    const options = {
      endpoint: process.env.SFA_ENDPOINT + "/v2/users",
    };
    const response: AxiosResponse<any> = await this.apiHelper.fetchData(
      options,
      filters
    );
    return response.data;
  }

  public transformSfaUserResponse(step: string, sfaUsers: any): Promise<any> {
    const stepMap = {
      allTeamsHead: () => this.prepareAllTeamsHeadResponse(sfaUsers),
    };

    return stepMap[step]?.() ?? sfaUsers;
  }

  public prepareAllTeamsHeadResponse(sfaUsers: any[]) {
    return sfaUsers
      .filter((user) => user.team_rm_mapping?.[0]?.team_uuid)
      .map((user) => ({
        salesName: user.name,
        designationId: user.designation_id,
        iamUuid: user.iam_uuid,
        teamUuid: user.team_rm_mapping[0].team_uuid,
        name: user.team_rm_mapping[0].team_name,
      }));
  }

  public async fetchTeamDetails(teamUuid: string): Promise<any> {
    const options = {
      endpoint: `${process.env.SFA_ENDPOINT}/v2/teams/${teamUuid}`,
    };

    try {
      const response: AxiosResponse<any> = await this.apiHelper.fetchData(
        options,
        {}
      );
      return response?.data;
    } catch (error) {
      Logger.error(`Error fetching team details for UUID: ${teamUuid}`, error);
      throw new HttpException("Error fetching team details", 500);
    }
  }

  @UseCache({ expiryTimer: 1800 }) // 30 min
  public async isSfaInSalesHierarchy(
    loggedInSalesUuid: string,
    teamUuid: string,
    requestedSalesUuid: string
  ): Promise<SfaHierarchyCheckResponse> {
    const result = {
      isUserInHierarchy: false,
      sfaUser: null,
    };
    if (!requestedSalesUuid || requestedSalesUuid === loggedInSalesUuid) {
      result.isUserInHierarchy = true;
      return result;
    }

    // get requested sfa user details
    const queryParams = {
      iam_uuid: requestedSalesUuid,
      getSalesMapping: true,
    };
    const salesList = await this.getSfaUsers(queryParams);
    const salesHierarchy = salesList.data[0]?.sales_agents?.[teamUuid];

    result.sfaUser = salesList.data[0];

    for (const sfa of salesHierarchy) {
      if (sfa.iam_uuid === loggedInSalesUuid) {
        result.isUserInHierarchy = true;
        break;
      }
    }

    return result;
  }

  @UseCache({ expiryTimer: 60 * 60 * 3 })
  public async fetchDesignations() {
    const options = {
      endpoint: `${process.env.SFA_ENDPOINT}/v1/designations`,
    };

    const response: AxiosResponse<any> = await this.apiHelper.fetchData(
      options,
      {}
    );
    return response?.data;
  }

  @UseCache({ expiryTimer: 60 * 60 })
  public async fetchTeams() {
    const options = {
      endpoint: `${process.env.SFA_ENDPOINT}/v2/teams`,
    };

    const response: any = await this.apiHelper.fetchData(options, {});

    return response?.data;
  }
}

export async function isUserInUpperHierarchy(
  sfaUserHeirarchyData: any,
  targetUserUuid: any
) {
  const salesAgentsHeirarchy: any = sfaUserHeirarchyData?.data[0]?.sales_agents;
  function fetchUser() {
    let found = false;
    Object.values(salesAgentsHeirarchy).forEach((salesAgents: any[]) => {
      salesAgents.forEach((agent) => {
        if (String(agent?.uuid).trim() === String(targetUserUuid).trim()) {
          found = true;
        }
      });
    });
    return found;
  }
  return fetchUser();
}

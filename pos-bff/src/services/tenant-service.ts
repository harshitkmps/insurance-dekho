import { Injectable, Logger } from "@nestjs/common";
import MasterAPIService from "./master-service";
import { PosRoles } from "../constants/pos-roles.constants";

@Injectable()
export default class TenantService {
  constructor(private masterAPIService: MasterAPIService) {}

  public async getTenantDetailsFromMaster(
    userInfo: any,
    query: any
  ): Promise<any> {
    const tenantId = userInfo.tenant_id ? parseInt(userInfo.tenant_id) : 1;

    if (tenantId === 1) {
      const tenantInfo = {
        source: userInfo.source,
        subSource: query.requestSource,
      };
      Logger.debug("tenantId is 1 with source and sub-source", tenantInfo);
      return tenantInfo;
    }

    const tenantsData = await this.masterAPIService.getTenantDetails();
    Logger.debug("tenant id value received", { tenantId });
    let tenantInfo = tenantsData.tenant.find(
      (tenant: any) => tenant.id === tenantId
    );
    if (!tenantInfo) {
      throw {
        message: "Tenant details not found for given tenant ID",
        status: 400,
        code: "Bad Request",
      };
    }
    tenantInfo = {
      source: tenantInfo.source,
      subSource: tenantInfo.sub_source,
    };

    return tenantInfo;
  }

  public async getUserBasedTenantConfig(userInfo: any) {
    userInfo.tenant_id = Number(userInfo.tenant_id) || 1;
    const result = {
      isRefAuthVisible: false,
      isTenantListVisible: false,
      tenantList: [],
    };
    const tenantsList = await this.masterAPIService.getTenantDetails();
    if (userInfo.pos_role_id === PosRoles.Agent) {
      if (userInfo.tenant_id !== 1) {
        const tenantInfo = tenantsList.tenant.find(
          (tenant: any) => tenant.id === userInfo.tenant_id
        );
        result.isRefAuthVisible = tenantInfo?.login_mode === "SSO";
      }
      return result;
    }

    const tenants: any[] = tenantsList.tenant.map((tenantDetails: any) => ({
      id: tenantDetails.id,
      name: tenantDetails.name,
      loginMode: tenantDetails.login_mode,
    }));
    result.isRefAuthVisible = true;
    result.isTenantListVisible = true;
    result.tenantList = tenants;
    return result;
  }
}

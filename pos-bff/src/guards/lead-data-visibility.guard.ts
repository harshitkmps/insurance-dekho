import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import ContextHelper from "../services/helpers/context-helper";
import { PosRoles } from "../constants/pos-roles.constants";
import LosService from "../services/los-service";
import { Roles } from "../constants/roles.constants";

@Injectable()
export class LeadDataVisibilityGuard implements CanActivate {
  constructor(private losService: LosService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: ReqWithUser = context.switchToHttp().getRequest();
    const userInfo = req.userInfo;
    const leadId = ContextHelper.getStore().get("leadId");
    const userUuid = userInfo?.uuid;
    const accountType = userInfo?.accountType;
    // If `accountType` is null, it indicates that the logged-in user is neither associated with an ID-user nor a lead.
    // This means the user is completely new to the system.
    if (!accountType) {
      return true;
    }
    // If the user is a lead, return only their own data. The leadId will be overwritten with the user's UUID,
    // as leads are not authorized to access data belonging to other users.
    if (accountType === "lead") {
      return true;
    }
    let attachLeadData: boolean = false;
    const roleId = userInfo?.agentDetails?.role_id;
    Logger.log("Fetching data for lead", leadId);
    const leadInfo = await this.losService.fetchLeadDetails(leadId, {});
    if (!Object.keys(leadInfo).length) {
      throw new HttpException("Lead not found", HttpStatus.NOT_FOUND);
    }
    Logger.debug("leadInfo", leadInfo);
    const leadUuid = leadInfo?.lead?.uuid;
    const referrerUserId = leadInfo?.lead?.referrerUserId;
    // If the user is Super Admin or Admin, return the asked data.
    if (Roles.POS_ADMIN_ALL.includes(roleId)) {
      attachLeadData = true;
    }
    // If the user is an Agent, verify whether the requested lead data belongs to the agent's own lead or a lead they have referred.
    else if (
      roleId === PosRoles.Agent &&
      (referrerUserId === userUuid || leadUuid === userUuid)
    ) {
      attachLeadData = true;
    }
    // If the user is from the Sales team, verify whether the lead is assigned to them by checking the assignedSalesPersonUuid. The user can also access lead data if the lead is assigned to their direct or indirect junior.
    else if (Roles.POS_SALES_ALL.includes(roleId)) {
      const assignedSalesPersonUuid = leadInfo?.lead?.assignedSalesUserId;
      if (assignedSalesPersonUuid === userUuid) {
        ContextHelper.getStore().set("leadInfo", leadInfo);
        return true;
      }
      Logger.debug("Fetching hierarchy data for lead", leadId);
      const leadDataFromEs: any = await this.getLeadDetailsFromElasticSearch(
        leadId
      );
      const leadPath = leadDataFromEs?.path || "";
      const isUserPresentInPath = leadPath.includes(userUuid);
      if (isUserPresentInPath) {
        attachLeadData = true;
      }
    }
    if (attachLeadData) {
      ContextHelper.getStore().set("leadInfo", leadInfo);
      return true;
    }
    throw new UnauthorizedException("Not authorized to view the lead details");
  }

  async getLeadDetailsFromElasticSearch(leadUuid: string): Promise<string> {
    const losResponse: any = await this.losService.searchLeads({
      getAllLeads: 1,
      leadUuid,
    });
    return losResponse?.data?.data?.[0];
  }
}

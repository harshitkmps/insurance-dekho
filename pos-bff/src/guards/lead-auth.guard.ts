import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from "@nestjs/common";
import CommonApiHelper from "../services/helpers/common-api-helper";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import ContextHelper from "../services/helpers/context-helper";
import { Roles } from "../constants/roles.constants";
import LosService from "../services/los-service";

@Injectable()
export class LeadAuthGuard implements CanActivate {
  constructor(
    private apiHelper: CommonApiHelper,
    private losService: LosService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: ReqWithUser = context.switchToHttp().getRequest();
    const authorization = req.header("Authorization");
    const payload = await this.decodeJWTFromReq(authorization);
    Logger.debug("payload : ", { payload: payload });
    const uuid = payload.data.uuid;
    const mobile = payload.data.mobile.toString();
    const email = payload.data.email;
    const tenantId = payload.data.tenantId;
    Logger.debug(
      `user detail iam_id : ${uuid} mobile : ${mobile} email : ${email}`
    );
    let details: any = {
      mobile: mobile,
      email: email,
      uuid: uuid,
      tenantId: tenantId,
    };
    const userInfo: any = await this.getUserInfo(authorization);
    Logger.debug("userInfo", userInfo);
    if (userInfo) {
      details = { ...details, ...userInfo, accountType: "user" };
    } else {
      const leadInfo = await this.losService.fetchLeadDetails(uuid, {});
      if (Object.keys(leadInfo).length) {
        details = { ...details, ...leadInfo, accountType: "lead" };
      }
    }
    const roleId = details?.agentDetails?.role_id;
    let leadId = details?.uuid;
    if (userInfo && Roles.POS_SUB_AGENT !== roleId) {
      leadId = req?.body?.leadId || req?.query?.leadId;
    }
    ContextHelper.getStore().set("leadId", leadId);
    req.userInfo = details;
    return true;
  }

  async decodeJWTFromReq(authorization: string) {
    const token = authorization.split(" ")[1];
    Logger.log("decoding jwt token: " + token);
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const buff = Buffer.from(base64, "base64");
    const payloadinit = buff.toString("ascii");
    return JSON.parse(payloadinit);
  }

  async getUserInfo(authorization: string) {
    try {
      const headers = {
        authorization,
      };
      const options = {
        // write v2 api in apipos
        endpoint: `${process.env.API_POS_ENDPOINT}/v1/agent/details`,
        config: {
          headers,
        },
      };
      const response: any = await this.apiHelper.fetchData(options, {});
      if (response?.data?.isExistingAgent) {
        return response.data;
      }
      return null;
    } catch (e) {
      Logger.debug(`user data not found`);
    }
  }
}

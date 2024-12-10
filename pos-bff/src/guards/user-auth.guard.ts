import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import CommonApiHelper from "../services/helpers/common-api-helper";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(private apiHelper: CommonApiHelper) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: ReqWithUser = context.switchToHttp().getRequest();
    const authorization = req.header("Authorization");
    const payload = await this.decodeJWTFromReq(authorization);
    Logger.debug("payload : ", { payload: payload });
    const uuid = payload.data.uuid;
    const mobile = payload.data.mobile;
    const email = payload.data.email;
    Logger.debug(
      `user detail iam_id : ${uuid} mobile : ${mobile} email : ${email}`
    );
    const userInfo = await this.getUserInfo(authorization);
    req.userInfo = { ...userInfo, mobile };
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
    const headers = {
      authorization,
    };
    const options = {
      endpoint: process.env.API_POS_ENDPOINT + "/v1/user-info",
      method: "GET",
      config: {
        headers: headers,
      },
    };

    const response: any = await this.apiHelper.fetchData(options, {});
    Logger.debug("user response received ", response);
    if (response?.status === 200) {
      return response.data.user_basic_info;
    }
    throw new UnauthorizedException("no details found for user in pos");
  }
}

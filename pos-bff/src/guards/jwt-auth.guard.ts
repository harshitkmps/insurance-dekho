import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { verifyToken } from "../utils/jwt-utils";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import ApiPosService from "../services/apipos-service";
import TokenService from "../services/token.service";

@Injectable()
export class JWTAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private apiposService: ApiPosService,
    private tokenService: TokenService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: ReqWithUser = context.switchToHttp().getRequest();
    const authorization = req.header("Authorization");
    const jwtConfigType = this.reflector.getAllAndOverride<string>(
      "jwtConfigType",
      [context.getHandler(), context.getClass()]
    );
    if (!authorization) {
      return false;
    }
    const token = authorization.split(" ")[1];
    if (!token) {
      return false;
    }
    const payload: any = await this.tokenService.verifyToken(
      jwtConfigType,
      token
    );
    if (!payload) {
      return false;
    }
    const uuid = payload.data?.uuid;
    if (!uuid) {
      return false;
    }
    const userDetails = await this.apiposService.fetchUserDetails(uuid);
    if (!userDetails) {
      throw new ForbiddenException("User not found");
    }
    req.userInfo = userDetails;
    return true;
  }
}

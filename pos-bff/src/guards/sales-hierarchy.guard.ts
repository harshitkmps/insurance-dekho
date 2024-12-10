import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
} from "@nestjs/common";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import SalesService from "../services/sales-service";
import { Roles } from "../constants/roles.constants";
import { Reflector } from "@nestjs/core";
import _ from "lodash";
import { HierarchyOptions } from "../interfaces/guards/sales-hierarchy-options.interface";
import ContextHelper from "../services/helpers/context-helper";

@Injectable()
export class SalesHierarchyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private salesService: SalesService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: ReqWithUser = context.switchToHttp().getRequest();
    const options: HierarchyOptions =
      this.reflector.getAllAndOverride<HierarchyOptions>("options", [
        context.getHandler(),
        context.getClass(),
      ]);

    const store = ContextHelper.getStore();

    const uuid = _.get(req, options.uuidPath);
    const teamUuid =
      _.get(req, options.teamUuidPath) ||
      req.userInfo.team_rm_mapping?.[0]?.team_uuid;

    try {
      // get single sfa user details
      const result = await this.salesService.isSfaInSalesHierarchy(
        req.userInfo.uuid,
        teamUuid,
        uuid
      );

      if (Roles.POS_ADMIN_ALL.includes(req.userInfo.pos_role_id)) {
        // admin has all the accesses
        store.set("sfaUser", result.sfaUser);
        return true;
      }

      if (!result.isUserInHierarchy) {
        throw new UnauthorizedException(
          "Logged in user is not in the structure of accessed user"
        );
      }

      store.set("sfaUser", result.sfaUser);
      return true;
    } catch (err) {
      if (err?.response?.errors?.length) {
        throw new HttpException(err.response.errors[0].message, err.status);
      }
      throw err;
    }
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
} from "@nestjs/common";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { Roles } from "../constants/roles.constants";
import { Reflector } from "@nestjs/core";
import _ from "lodash";
import DealerService from "../services/dealer-service";
import { HierarchyOptions } from "../interfaces/guards/sales-hierarchy-options.interface";
import ContextHelper from "../services/helpers/context-helper";

@Injectable()
export class DealerHierarchyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private dealerService: DealerService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: ReqWithUser = context.switchToHttp().getRequest();
    const options: HierarchyOptions =
      this.reflector.getAllAndOverride<HierarchyOptions>("options", [
        context.getHandler(),
        context.getClass(),
      ]);

    const store = ContextHelper.getStore();

    const dealerUuid = _.get(req, options.uuidPath);
    const teamUuid =
      _.get(req, options.teamUuidPath) ||
      req.userInfo.team_rm_mapping?.[0]?.team_uuid;

    try {
      if (Roles.POS_ADMIN_ALL.includes(req.userInfo.pos_role_id)) {
        const result = await this.dealerService.isSfaInDealerHierarchy(
          req.userInfo.uuid,
          dealerUuid,
          teamUuid
        );

        if (Roles.POS_ADMIN_ALL.includes(req.userInfo.pos_role_id)) {
          // admin has all the accesses
          store.set("cpsUser", result.cpsUser);
          return true;
        }

        if (!result.isUserInHierarchy) {
          throw new UnauthorizedException(
            "Not authorized to access this dealer"
          );
        }
        store.set("cpsUser", result.cpsUser);
      }

      return true;
    } catch (err) {
      if (err?.response?.errors?.length) {
        throw new HttpException(err.response.errors[0].message, err.status);
      }
      throw err;
    }
  }
}

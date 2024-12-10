import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ReqWithUser } from "../interfaces/request/req-with-user.interface";
import { PosRoles } from "../constants/pos-roles.constants";
import ApiPosService from "../services/apipos-service";

@Injectable()
export class CaseListingAuthGuard implements CanActivate {
  constructor(private apiPosService: ApiPosService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: ReqWithUser = context.switchToHttp().getRequest();
    const roleId = req.userInfo?.pos_role_id;
    const userUUID = req.userInfo?.uuid;
    if (!roleId || !userUUID) {
      return false;
    }
    const unauthorisedRoles = [
      PosRoles.Finance,
      PosRoles.Compliance,
      PosRoles.Caller,
      PosRoles.Admin,
    ];
    if (unauthorisedRoles.includes(roleId)) {
      Logger.error(
        `Unauthorized user tried new case listing with uuid: ${userUUID}`
      );
      throw new ForbiddenException("User not authorised for case listing");
    }
    if (roleId == PosRoles.Executive) {
      const channelPartnerId = req.body?.filters?.channelIamId;
      if (channelPartnerId) {
        const isAuthorised = await this.apiPosService.isInternalUserMapped({
          product: req.body?.productType?.toLowerCase(),
          dealerUUID: channelPartnerId,
          assigneeIamId: userUUID,
        });
        if (!isAuthorised) {
          throw new ForbiddenException("User not mapped with requested user");
        }
      }
    }
    return true;
  }
}

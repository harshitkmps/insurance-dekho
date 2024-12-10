import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const authorizedRoles = this.reflector.getAllAndOverride<number[]>(
      "roles",
      [context.getHandler(), context.getClass()]
    );
    if (!authorizedRoles?.length) {
      return true;
    }
    const { userInfo } = context.switchToHttp().getRequest();
    return authorizedRoles.includes(userInfo.pos_role_id);
  }
}

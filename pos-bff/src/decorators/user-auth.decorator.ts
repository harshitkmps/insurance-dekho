import { SetMetadata, UseGuards, applyDecorators } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { RolesGuard } from "../guards/roles.guards";
import { UserAuthGuard } from "../guards/user-auth.guard";

export function UserAuth(...roles: number[]) {
  return applyDecorators(
    SetMetadata("roles", roles),
    UseGuards(UserAuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: "user not authorized" }),
    ApiForbiddenResponse()
  );
}

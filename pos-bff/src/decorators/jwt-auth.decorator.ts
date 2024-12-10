import { SetMetadata, UseGuards, applyDecorators } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { RolesGuard } from "../guards/roles.guards";
import { UserAuthGuard } from "../guards/user-auth.guard";
import { JWTAuthGuard } from "../guards/jwt-auth.guard";

export function JWTAuth(jwtConfigType: string) {
  return applyDecorators(
    SetMetadata("jwtConfigType", jwtConfigType),
    UseGuards(JWTAuthGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: "user not authorized" }),
    ApiForbiddenResponse()
  );
}

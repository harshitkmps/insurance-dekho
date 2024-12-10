import { SetMetadata, UseGuards, applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { RolesGuard } from "../guards/roles.guards";
import { LeadAuthGuard } from "../guards/lead-auth.guard";

export function LeadAuth(...roles: number[]) {
  return applyDecorators(
    SetMetadata("roles", roles),
    UseGuards(LeadAuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: "user not authenticated" })
  );
}

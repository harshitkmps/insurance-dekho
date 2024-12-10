import { UseGuards, applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { RolesGuard } from "../guards/roles.guards";
import { LeadAuthGuard } from "../guards/lead-auth.guard";
import { CaseListingAuthGuard } from "../guards/case-listing.guard";

export function CaseListingAuth() {
  return applyDecorators(
    UseGuards(CaseListingAuthGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: "user not authenticated" })
  );
}

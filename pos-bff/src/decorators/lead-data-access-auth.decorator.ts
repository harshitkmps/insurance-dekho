import { UseGuards, applyDecorators } from "@nestjs/common";
import { ApiUnauthorizedResponse } from "@nestjs/swagger";
import { LeadDataVisibilityGuard } from "../guards/lead-data-visibility.guard";

export function LeadDataVisibilityAuth() {
  return applyDecorators(
    UseGuards(LeadDataVisibilityGuard),
    ApiUnauthorizedResponse({
      description: "Not authorized to view the lead details",
    })
  );
}

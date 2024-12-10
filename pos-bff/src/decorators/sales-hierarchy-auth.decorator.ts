import { SetMetadata, UseGuards, applyDecorators } from "@nestjs/common";
import { ApiForbiddenResponse } from "@nestjs/swagger";
import { SalesHierarchyGuard } from "../guards/sales-hierarchy.guard";
import { HierarchyOptions } from "../interfaces/guards/sales-hierarchy-options.interface";

export function SalesHierarchyAuth(options: HierarchyOptions) {
  return applyDecorators(
    SetMetadata("options", options),
    UseGuards(SalesHierarchyGuard),
    ApiForbiddenResponse({ description: "SFA User is not in hierarchy" })
  );
}

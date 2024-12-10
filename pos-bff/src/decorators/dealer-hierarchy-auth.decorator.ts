import { SetMetadata, UseGuards, applyDecorators } from "@nestjs/common";
import { ApiForbiddenResponse } from "@nestjs/swagger";
import { HierarchyOptions } from "../interfaces/guards/sales-hierarchy-options.interface";
import { DealerHierarchyGuard } from "../guards/dealer-hierarchy.guard";

export function DealerHierarchyAuth(options: HierarchyOptions) {
  return applyDecorators(
    SetMetadata("options", options),
    UseGuards(DealerHierarchyGuard),
    ApiForbiddenResponse({ description: "Dealer is not in sales hierarchy" })
  );
}

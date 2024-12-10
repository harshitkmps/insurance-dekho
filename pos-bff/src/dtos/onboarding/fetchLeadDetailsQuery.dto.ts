import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

export class FetchLeadDetailsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  leadId?: string;

  @ApiPropertyOptional()
  @Transform(({ obj }) => {
    return obj.fetchLight === "true";
  })
  @IsBoolean()
  @IsOptional()
  fetchLight?: boolean = false;
}

import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class GetSinglePartnerStatsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  uuid?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  teamUuid?: string;

  @ApiPropertyOptional()
  @Transform(({ obj }) => obj.isPmtd === "true")
  @IsBoolean()
  @IsOptional()
  isPmtd?: boolean = false;

  @ApiPropertyOptional()
  @Transform(({ obj }) => obj.isRenewalDashboard === "true")
  @IsBoolean()
  @IsOptional()
  isRenewalDashboard?: boolean = false;
}

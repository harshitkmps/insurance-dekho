import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from "class-validator";
import { GetPartnerBaseCohortsDto } from "./get-partner-base-cohorts.dto";
import { PARTNER_BASE_COHORTS } from "@/src/constants/dashboard.constants";
import { Transform } from "class-transformer";

export class GetPartnerBaseDealersDto extends GetPartnerBaseCohortsDto {
  @ApiProperty()
  @IsIn(Object.keys(PARTNER_BASE_COHORTS), {
    message: "Invalid cohort name passed",
  })
  cohortName: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(1)
  @Max(51)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  offset?: number;

  @ApiPropertyOptional()
  @Transform(({ obj }) => obj.isPmtd === "true")
  @IsBoolean()
  @IsOptional()
  isPmtd?: boolean;

  @ApiPropertyOptional()
  @Transform(({ obj }) => obj.isDownload === "true")
  @IsBoolean()
  @IsOptional()
  isDownload?: boolean;
}

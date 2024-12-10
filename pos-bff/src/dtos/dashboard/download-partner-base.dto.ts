import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { GetPartnerBaseCohortsDto } from "./get-partner-base-cohorts.dto";
import { PARTNER_BASE_COHORTS } from "@/src/constants/dashboard.constants";
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from "class-validator";

export class DownloadPartnerBaseDto extends GetPartnerBaseCohortsDto {
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
  @IsBoolean()
  @IsOptional()
  isPmtd?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isDownload?: boolean;
}

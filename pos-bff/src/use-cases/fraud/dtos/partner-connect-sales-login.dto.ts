import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class getSalesUserLoginDetailsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  teamUuid?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  searchName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nonloggedInUser?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentPageLastRow?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentPageFirstRow?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  includeAllSubReportees?: string;
}

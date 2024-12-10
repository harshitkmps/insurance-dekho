import { ContestViews, Tabs } from "@/src/constants/contests.constants";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class GetContestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ContestViews)
  view: ContestViews;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contestId?: string;

  @ApiPropertyOptional()
  @IsEnum(Tabs)
  @IsOptional()
  tabSelected?: Tabs;

  @ApiPropertyOptional()
  @IsOptional()
  attributes?: Record<string, string>;
}

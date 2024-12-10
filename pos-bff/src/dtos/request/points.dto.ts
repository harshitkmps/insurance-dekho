import { type } from "@/src/constants/points.constants";
import { Transform } from "class-transformer";
import {
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  IsEnum,
} from "class-validator";

export class FetchPointsListDto {
  @IsOptional()
  @IsString()
  @IsEnum(type)
  type: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value !== "all" ? value : ""))
  lob: string;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  endDate: Date;

  @IsOptional()
  @IsString()
  userId: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  limit: number = 15;
}

export class FetchPointsBreakUpDto {
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  startDate: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  endDate: Date;

  @IsOptional()
  @IsString()
  userId: string;
}

export class GetClubsDetailDto {
  @IsOptional()
  @IsNumber()
  index: number;

  @IsOptional()
  @IsString()
  name: string;
}

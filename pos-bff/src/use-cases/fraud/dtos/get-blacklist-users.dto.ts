import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class GetBlacklistUsersDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nextCursor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  blacklistAttributeKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  blacklistAttributeValue?: string;
}

export class GetBlacklistUsersParams extends GetBlacklistUsersDto {
  limit: number;
  projections: string;
}

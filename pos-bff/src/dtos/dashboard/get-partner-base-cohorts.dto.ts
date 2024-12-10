import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class GetPartnerBaseCohortsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  uuid?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  teamUuid?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lob?: string;
}

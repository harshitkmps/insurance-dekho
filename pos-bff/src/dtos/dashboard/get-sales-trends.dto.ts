import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class GetSalesTrendsDto {
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
  product?: string;
}

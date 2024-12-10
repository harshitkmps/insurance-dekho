import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class GetDealersListDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dealerGcdCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dealerName: string;

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
}

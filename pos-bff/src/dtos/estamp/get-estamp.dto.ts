import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class GetEStampsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nextCursor?: string;
}

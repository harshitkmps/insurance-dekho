import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class GetDealerByUuidQuery {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  teamUuid?: string;

  @ApiPropertyOptional()
  @Transform(({ obj }) => obj.getDecryptedMobileEmail === "true")
  @IsBoolean()
  @IsOptional()
  getDecryptedMobileEmail?: boolean;
}

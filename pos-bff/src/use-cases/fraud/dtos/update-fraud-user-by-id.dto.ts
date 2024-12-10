import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateFraudUserByIdReq {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  status?: string;
}

export class PatchFraudUserByIdBody {
  lastUpdatedBy: string;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SaveEStampDto {
  @ApiProperty()
  @IsString()
  file: string;
}

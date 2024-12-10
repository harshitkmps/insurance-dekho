import {
  IsString,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class ScriptDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}

export class VideoSubmitDto {
  @IsNotEmpty()
  @IsString()
  docId: string;

  @IsNotEmpty()
  @IsNumber()
  requestId: number;

  @IsNotEmpty()
  @IsString()
  inspectionCaseId: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ScriptDto)
  script: ScriptDto;

  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsString()
  ticketUuid: string;
}

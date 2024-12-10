import { IsString } from "class-validator";

export class AddCompareFilesBody {
  @IsString()
  email: string;

  @IsString()
  uuid: string;

  @IsString()
  type: string;

  @IsString()
  requestSource: string;

  @IsString()
  fileLink1: string;

  @IsString()
  fileLink2: string;

  @IsString()
  name: string;
}

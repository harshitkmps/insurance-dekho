import { IsString, IsNotEmpty } from "class-validator";

export class GetKycDocsDto {
  @IsNotEmpty()
  @IsString()
  dob: string;

  @IsNotEmpty()
  @IsString()
  pan: string;
}

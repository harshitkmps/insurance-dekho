import { IsString, IsNotEmpty } from "class-validator";

export class GetLifeDocumentsDto {
  @IsNotEmpty()
  @IsString()
  insurerId: string;

  @IsNotEmpty()
  @IsString()
  subProductTypeId: string;

  @IsNotEmpty()
  @IsString()
  journeyType: string;

  @IsNotEmpty()
  @IsString()
  policyType: string;

  @IsNotEmpty()
  @IsString()
  productType: string;
}

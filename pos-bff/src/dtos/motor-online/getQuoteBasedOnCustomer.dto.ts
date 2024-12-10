import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class GetQuoteBasedOnCustomerDto {
  @IsNotEmpty()
  @IsNumber()
  planId: number;

  @IsNotEmpty()
  @IsNumber()
  insurerId: number;

  @IsNotEmpty()
  @IsString()
  leadId: string;

  @IsNotEmpty()
  @IsString()
  customerType: string;

  @IsNotEmpty()
  @IsString()
  vehicleCategory: string;
}

import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsNumber,
  IsOptional,
} from "class-validator";

export class VideoVerificationLinkDto {
  @IsNotEmpty()
  @IsString()
  middelwareId: string;

  @IsNotEmpty()
  @IsNumber()
  requestId: number;

  @IsNotEmpty()
  @IsString()
  customerName: string;

  @IsNotEmpty()
  @IsString()
  planName: string;

  @IsNotEmpty()
  @IsString()
  insurerName: string;

  @IsNotEmpty()
  @IsNumber()
  sendCommunication: number;

  @IsNotEmpty()
  @IsNumber()
  isOfflineRequest: number;

  @IsNotEmpty()
  @IsString()
  medium: string;

  @IsOptional()
  @IsEmail({}, { message: "email must be a valid email address" })
  emailId?: string;

  @IsOptional()
  @IsString()
  contactNumber?: string;
}

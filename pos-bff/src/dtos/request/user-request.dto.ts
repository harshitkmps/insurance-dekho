import {
  IsNumber,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserBody {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Matches(
    new RegExp(
      "^\\w+[-\\.\\w]*@(?!(?:insurancedekho)\\.com$)\\w+[-\\.\\w]*?\\.\\w{2,4}$"
    ),
    {
      message: "Email is invalid",
    }
  )
  @ValidateIf((obj: any) => !!obj.email)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobile?: string;
}

export class UpdateUserAddress {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(100000)
  @Max(999999)
  pincode?: number;
}
export class UpdateUserBasicDetailsDto {
  @ApiPropertyOptional()
  uuid: string;
  @ApiPropertyOptional()
  isActive?: boolean;
  @ApiPropertyOptional()
  irdaId?: string;
  @ApiPropertyOptional()
  irdaReportingDate?: string;
  @ApiPropertyOptional()
  reasonForInactivation?: number;
  @ApiPropertyOptional()
  convertRAPToMaster?: boolean;
  @ApiPropertyOptional()
  isRedemptionAllowed?: boolean;
  @ApiPropertyOptional()
  reasonForRedemptionDisable?: string;
}

export class SoftDeleteUserDto {
  @IsString()
  @IsNotEmpty()
  uuid: string;
  mobile: string;
  channelPartnerId?: string;
  tenantId: number;
}

export class SearchUserRequestDto {
  @ApiPropertyOptional()
  @IsEmail()
  @ValidateIf((obj: any) => !!obj.email)
  email?: string;

  @ApiPropertyOptional()
  @MinLength(10, {
    message: "mobile length should be 10",
  })
  @MaxLength(10, {
    message: "mobile length should be 10",
  })
  @ValidateIf((obj: any) => !!obj.mobile)
  mobile?: string;

  @ApiPropertyOptional()
  gcdCode?: string;

  @ApiPropertyOptional()
  @MinLength(10, {
    message: "pan length should be 10",
  })
  @MaxLength(10, {
    message: "pan length should be 10",
  })
  @ValidateIf((obj: any) => !!obj.pan)
  pan?: string;
}

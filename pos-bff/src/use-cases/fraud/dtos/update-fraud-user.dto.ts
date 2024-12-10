import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateFraudUserBody {
  @IsString()
  blacklistAttributeKey: string;

  @IsString()
  blacklistAttributeValue: string;

  @IsBoolean()
  isFraud: boolean;

  @IsOptional()
  shouldEncrypt?: boolean;
}

export interface UpdateFraudUserReq extends UpdateFraudUserBody {
  uuid: string;
}

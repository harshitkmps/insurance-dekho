import { IsOptional, IsString } from "class-validator";

export class GetBlacklistUserByIdQuery {
  @IsOptional()
  @IsString()
  blacklistUserProjections?: string;

  @IsOptional()
  @IsString()
  activityProjections?: string;
}

export class GetBlacklistUserByIdParams extends GetBlacklistUserByIdQuery {
  fetchUserActivity: string;
}

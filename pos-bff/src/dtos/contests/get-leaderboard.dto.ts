import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GetLeaderboardDto {
  @ApiProperty()
  @IsString()
  contestId: string;

  @ApiProperty()
  @IsString()
  view: string;
}

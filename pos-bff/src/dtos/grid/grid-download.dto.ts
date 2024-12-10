import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class DownloadGridPointsDto {
  @ApiProperty()
  @IsString()
  startDate: string;

  @ApiProperty()
  @IsString()
  endDate: string;

  @ApiProperty()
  @IsString()
  vehicleType: string;

  @ApiProperty()
  @IsString()
  productType: string;

  @ApiProperty()
  @IsString()
  stateId: string;

  // @ApiProperty()
  // @IsString()
  // zoneId: string;
}

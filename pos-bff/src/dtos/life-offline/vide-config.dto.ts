import { IsString, IsNotEmpty } from "class-validator";

export class GetVideoConfigDto {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsNotEmpty()
  @IsString()
  inspectionCaseId: string;

  @IsNotEmpty()
  @IsString()
  isOfflineRequest: string;

  @IsNotEmpty()
  @IsString()
  ticketUuid: string;
}

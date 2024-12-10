import { IsString, IsNotEmpty } from "class-validator";

export class GetLifeTicketDetailsDto {
  @IsNotEmpty()
  @IsString()
  ticketUuid: string;
}

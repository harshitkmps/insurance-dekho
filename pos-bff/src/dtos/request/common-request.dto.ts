import { IsNotEmpty } from "class-validator";

export class DialerSetCallbackRequestDto {
  @IsNotEmpty()
  leadId: string;

  @IsNotEmpty()
  product: string;
}

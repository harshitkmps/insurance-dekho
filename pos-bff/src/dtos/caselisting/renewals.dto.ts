import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GetPolicyDocLinkQueryDto {
  @ApiProperty()
  @IsString()
  leadId: string;

  @ApiProperty()
  @IsString()
  product: string;
}

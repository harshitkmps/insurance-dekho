import { ApiProperty } from "@nestjs/swagger";

export class createMotorLeadRequestDto {
  @ApiProperty({
    type: Object,
    description: "A dynamic object with any number of properties",
  })
  body: Record<string, any>;
}

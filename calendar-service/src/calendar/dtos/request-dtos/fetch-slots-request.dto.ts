import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EVENT_TYPE } from 'src/calendar/enums/event-type.enum';
import { Participant } from './participants.dto';
export class FetchSlotsRequestDto {
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  // @Type(() => Participant)
  participants: Participant[];

  @IsNotEmpty()
  @ApiProperty()
  startTime: number;

  @IsNotEmpty()
  @ApiProperty()
  endTime: number;

  @ApiProperty()
  type: EVENT_TYPE[];

  @ApiProperty()
  @IsNotEmpty()
  offset: number;

  @ApiProperty()
  @IsNotEmpty()
  width: number;
}

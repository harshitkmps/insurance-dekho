import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { EventStatus } from 'src/calendar/enums/event-status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { EVENT_TYPE } from 'src/calendar/enums/event-type.enum';
import { Participant } from './participants.dto';

export class FetchEventRequestDto {
  @IsNotEmpty()
  @ApiProperty()
  // participantType: string;

  // @IsNotEmpty()
  // @ApiProperty()
  // @ArrayMinSize(1)
  // @ArrayMaxSize(5)
  // participantIds: string[];
  @ApiProperty()
  @IsArray()
  // @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  participants: Participant[];

  @ApiProperty()
  startTime: number;

  @IsNotEmpty()
  @ApiProperty()
  endTime: number;

  @ApiProperty()
  status: EventStatus[];

  @ApiProperty()
  type: EVENT_TYPE[];
}

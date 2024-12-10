import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { EventStatus } from 'src/calendar/enums/event-status.enum';
import { Participant } from './participants.dto';
import { EVENT_TYPE } from 'src/calendar/enums/event-type.enum';
import { Type } from 'class-transformer';
export class CreateEventRequestDto {
  @ApiProperty({ enum: EVENT_TYPE })
  @IsNotEmpty()
  @IsEnum(EVENT_TYPE)
  type: EVENT_TYPE;

  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  start_time: number;

  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  end_time: number;

  @ApiProperty()
  context: any;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  // @Type(() => Participant)
  participants: Participant[];

  @IsNotEmptyObject()
  @ApiProperty()
  meta_data: any;

  @ApiProperty({ enum: EventStatus })
  @IsEnum(EventStatus)
  status: EventStatus;
}

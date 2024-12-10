import { Participant } from 'src/calendar/dtos/request-dtos/participants.dto';
import { EventStatus } from 'src/calendar/enums/event-status.enum';
import { EVENT_TYPE } from 'src/calendar/enums/event-type.enum';

export class FilterEventDto {
  startTime: number;
  endTime: number;
  participants: Participant[];
  status?: EventStatus[];
  type: EVENT_TYPE[];
}

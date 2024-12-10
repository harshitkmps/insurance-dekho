import { ForbiddenException, Injectable } from '@nestjs/common';
import { EventService } from 'src/database/mongo/events/event.service';
import { CreateEventRequestDto } from '../dtos/request-dtos/create-event-request.dto';
import { CreateEventDto } from 'src/database/mongo/events/create-event.dto';
import { FetchEventRequestDto } from '../dtos/request-dtos/fetch-event-request.dto';
import { FetchSlotsRequestDto } from '../dtos/request-dtos/fetch-slots-request.dto';
import { FilterEventDto } from 'src/database/mongo/events/filter-event.dto';
import { each, map, compact } from 'lodash';
import { EventStatus } from '../enums/event-status.enum';
import { EVENT_TYPE } from '../enums/event-type.enum';

@Injectable()
export class CalendarService {
  constructor(private eventService: EventService) {}

  async createEvent(
    createEventRequestDto: CreateEventRequestDto,
  ): Promise<any> {
    const createEventDto: CreateEventDto = createEventRequestDto;
    console.log('createEventRequestDto', createEventRequestDto);
    console.log('createEventDto', createEventDto);
    if (createEventDto.type != EVENT_TYPE.REMINDER) {
      const existingEvent = await this.eventService.fetchWithFilters({
        startTime: createEventRequestDto.start_time,
        endTime: createEventRequestDto.end_time,
        participants: createEventRequestDto.participants,
        status: [EventStatus.CREATED, EventStatus.BLOCKED],
        type: [EVENT_TYPE.APPOINTMENT],
      });
      if (existingEvent.length) {
        throw new ForbiddenException(
          `Existing event already exist in given time slot`,
        );
      }
    }
    createEventDto.participants = map(createEventDto.participants, (p) => {
      return {
        idType: p.idType,
        idValue: p.idValue,
      };
    });
    const event = await this.eventService.create(createEventDto);
    console.log('event', JSON.stringify(event));
    return event;
  }

  async getEventById(id: string): Promise<any> {
    const event: any = await this.eventService.fetchById(id);
    return event;
  }

  async getEventsWithFilters(
    fetchEventRequestDto: FetchEventRequestDto,
  ): Promise<any> {
    if (!fetchEventRequestDto.type || fetchEventRequestDto.type.length == 0) {
      fetchEventRequestDto.type = [EVENT_TYPE.APPOINTMENT, EVENT_TYPE.REMINDER];
    }
    const filters: FilterEventDto = fetchEventRequestDto;
    return await this.eventService.fetchWithFilters(filters);
  }

  async updateEvent(
    id: string,
    updateEventRequestDto: Partial<CreateEventRequestDto>,
  ): Promise<any> {
    console.log('updateEventRequestDto', JSON.stringify(updateEventRequestDto));
    return await this.eventService.updateById(id, updateEventRequestDto);
  }

  async getAvailableSlots(
    fetchSlotsRequestDto: FetchSlotsRequestDto,
  ): Promise<any> {
    if (!fetchSlotsRequestDto.type || fetchSlotsRequestDto.type.length == 0) {
      fetchSlotsRequestDto.type = [EVENT_TYPE.APPOINTMENT];
    }
    if (!fetchSlotsRequestDto.offset) {
      fetchSlotsRequestDto.offset = 900;
    }
    if (!fetchSlotsRequestDto.width) {
      fetchSlotsRequestDto.width = 0;
    }
    const filters: FilterEventDto = fetchSlotsRequestDto;
    filters.status = [EventStatus.CREATED, EventStatus.BLOCKED];
    const existingEvents = await this.eventService.fetchWithFilters(filters);
    console.log('existingEvents', JSON.stringify(existingEvents));
    const busySlots = map(existingEvents, (event) => {
      return { st: event.start_time, et: event.end_time };
    });

    const getFreeSlots = (busySlots, startTime, endTime) => {
      if (busySlots.length == 0) {
        return [{ startTime, endTime }];
      }
      const mergedBusySlots = [];
      const finalFreeSlots = [];
      let st = busySlots[0].st;
      let et = busySlots[0].et;
      for (let i = 1; i < busySlots.length; i++) {
        const cs = busySlots[i];
        if (cs.et < startTime || cs.st > endTime) {
          break;
        }
        if (et < cs.st) {
          mergedBusySlots.push({ st, et });
          st = cs.st;
          et = cs.et;
          continue;
        }
        if (et >= cs.st) {
          et = Math.max(et, cs.et);
          continue;
        }
      }
      mergedBusySlots.push({ st, et });
      console.log('mergedBusySlots', mergedBusySlots);
      for (let i = 0; i < mergedBusySlots.length; i++) {
        const cs = mergedBusySlots[i];
        if (i == 0) {
          if (cs.st > startTime) {
            finalFreeSlots.push({ startTime: startTime, endTime: cs.st });
          }
        }
        if (i == mergedBusySlots.length - 1) {
          if (cs.et < endTime) {
            finalFreeSlots.push({ startTime: cs.et, endTime: endTime });
          }
        }
        if (i - 1 >= 0) {
          finalFreeSlots.push({
            startTime: mergedBusySlots[i - 1].et,
            endTime: cs.st,
          });
        }
      }
      return finalFreeSlots;
    };
    const totalFreeSlots = getFreeSlots(
      busySlots,
      fetchSlotsRequestDto.startTime,
      fetchSlotsRequestDto.endTime,
    );
    console.log('totalFreeSlots', JSON.stringify(totalFreeSlots));
    const filterFreeSlotsBasisOffsetAndDuration = (slots, offset, width) => {
      console.log('slots', JSON.stringify(slots));
      console.log('offset', JSON.stringify(offset));
      console.log('width', JSON.stringify(width));
      if (width <= 0) {
        return slots;
      }
      const offsettedSlots = [];
      each(slots, (slot) => {
        console.log('slot', JSON.stringify(slot));
        const closestOffsetTime = Math.ceil(slot.startTime / offset);
        for (let i = 0; i < 100; i++) {
          const offsettedStartTime = (closestOffsetTime + i) * offset;
          const endTime = offsettedStartTime + width;
          if (offsettedStartTime < slot.endTime && endTime <= slot.endTime) {
            offsettedSlots.push({
              startTime: offsettedStartTime,
              endTime: endTime,
            });
          }
        }
      });
      console.log('offsettedSlots', JSON.stringify(offsettedSlots));
      return offsettedSlots;
    };
    return filterFreeSlotsBasisOffsetAndDuration(
      totalFreeSlots,
      fetchSlotsRequestDto.offset,
      fetchSlotsRequestDto.width,
    );
  }
}

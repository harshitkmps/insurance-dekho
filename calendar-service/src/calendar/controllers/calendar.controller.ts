import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CalendarService } from '../services/calendar.service';
import { CreateEventRequestDto } from '../dtos/request-dtos/create-event-request.dto';
import { FetchSlotsRequestDto } from '../dtos/request-dtos/fetch-slots-request.dto';
// import { UpdateEventRequestDto } from '../dtos/request-dtos/update-event-request.dto';
import { FetchEventRequestDto } from '../dtos/request-dtos/fetch-event-request.dto';

@Controller('event')
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Post('/create')
  async createEvent(
    @Body()
    createEventRequestDto: CreateEventRequestDto,
  ): Promise<any> {
    const event = await this.calendarService.createEvent(createEventRequestDto);
    return {
      message: 'Event created successfully',
      event,
    };
  }

  @Get('/:id')
  async getEventById(@Param('id') id: string): Promise<any> {
    console.log('id', id);
    const event = await this.calendarService.getEventById(id);
    return {
      message: 'Event fetched successfully',
      event,
    };
  }

  @Post('/filters')
  async getEventsWithFilters(
    @Body() fetchEventRequestDto: FetchEventRequestDto,
  ): Promise<any> {
    console.log('fetchEventRequestDto', JSON.stringify(fetchEventRequestDto));
    const events = await this.calendarService.getEventsWithFilters(
      fetchEventRequestDto,
    );
    return {
      message: 'Events fetched successfully',
      events,
    };
  }

  @Put('/update/:id')
  async updateEvent(
    @Body() updateEventRequestDto: Partial<CreateEventRequestDto>,
    @Param('id') id: string,
  ): Promise<any> {
    console.log('id', id);
    console.log('updateEventRequestDto', updateEventRequestDto);
    await this.calendarService.updateEvent(id, updateEventRequestDto);
    return {
      message: 'event updated successfully',
    };
  }

  @Post('/available-slots')
  async getAvailableSlots(
    @Body() fetchSlotsRequestDto: FetchSlotsRequestDto,
  ): Promise<any> {
    console.log('fetchSlotsRequestDto', fetchSlotsRequestDto);
    const slots = await this.calendarService.getAvailableSlots(
      fetchSlotsRequestDto,
    );
    return {
      message: 'Available slots fetched successfully',
      slots,
    };
  }
}

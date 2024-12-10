import { Module } from '@nestjs/common';
import { EventService } from './events/event.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './events/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
  ],
  providers: [EventService],
  exports: [EventService],
})
export class MongoModule {}

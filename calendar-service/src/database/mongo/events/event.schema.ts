import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EventStatus } from 'src/calendar/enums/event-status.enum';

export type EventDocument = HydratedDocument<Event>;

@Schema({ timestamps: true })
export class Event {
  @Prop()
  type: string;

  @Prop({ type: Number })
  start_time: number;

  @Prop({})
  status: EventStatus;

  @Prop({ type: Number })
  end_time: number;

  @Prop({ type: Object })
  participants: any;

  @Prop({ type: Object })
  context: any;

  @Prop({ type: Object })
  meta_data: any;
}

export const EventSchema = SchemaFactory.createForClass(Event);

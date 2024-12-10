import { Module } from '@nestjs/common';
import { CalendarController } from './controllers/calendar.controller';
import { MongoModule } from 'src/database/mongo/mongo.module';
import { CalendarService } from './services/calendar.service';

@Module({
  imports: [MongoModule],
  exports: [],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}

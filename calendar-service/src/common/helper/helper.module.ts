import { Module } from '@nestjs/common';
import { ApiHelperService } from './api.helper';
import { TpApiLogService } from 'src/logger/tp-api-log';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [LoggerModule],
  providers: [ApiHelperService, TpApiLogService],
  exports: [ApiHelperService, LoggerModule],
})
export class HelperModule {}

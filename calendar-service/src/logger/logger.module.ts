import { Module } from '@nestjs/common';
import { ApiLogService } from './api-log';
import { TpApiLogService } from './tp-api-log';

@Module({
  imports: [],
  controllers: [],
  providers: [ApiLogService, TpApiLogService],
  exports: [ApiLogService, TpApiLogService],
})
export class LoggerModule {}

import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('/health')
  async healthCheck() {
    const response: any = {
      message: 'Application responded successfully',
    };
    return response;
  }
}

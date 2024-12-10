import { v4 } from 'uuid';
import asyncLocalStorage from 'src/common/context/local-storage';
import { ApiLogService } from 'src/logger/api-log';
import {
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
  Injectable,
  Scope,
} from '@nestjs/common';
import { logError } from 'src/logger/custom-logger';

@Injectable({ scope: Scope.REQUEST })
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private apiLog: ApiLogService) {}
  catch(exception: any, host: ArgumentsHost) {
    logError(`exception ${exception}`);
    const request = host.switchToHttp().getRequest();
    const response = host.switchToHttp().getResponse();
    const status =
      exception?.response?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
    const meta = {};
    this.apiLog.save(request, exception.response, meta);
    response.status(status).json({
      ...exception.response,
      ...meta,
      ...{
        'x-correlation-id':
          asyncLocalStorage?.getStore()?.get('x-correlation-id') ?? v4(),
      },
    });
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { v4 } from 'uuid';
import { ApiLogService } from 'src/logger/api-log';
import asyncLocalStorage from 'src/common/context/local-storage';
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private apiLog: ApiLogService) {}
  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    // console.log(response);
    return next.handle().pipe(
      map((result) => {
        const meta = {
          'x-correlation-id': (asyncLocalStorage.getStore() ?? v4()).get(
            'x-correlation-id',
          ),
        };
        if (request.originalUrl !== '/health') {
          this.apiLog.save(request, result, meta);
        }
        response.status(result.statusCode || HttpStatus.OK);
        return {
          ...result,
          ...meta,
        };
      }),
    );
  }
}

import { Injectable } from '@nestjs/common';
import * as moment from 'moment-timezone';
import { logMessage, logError } from './custom-logger';
@Injectable()
export class ApiLogService {
  async save(request: any, response: any, meta: any): Promise<boolean> {
    try {
      const logData = {
        request: {
          url: request.originalUrl,
          method: request.method,
          params: request.query,
          body: request.body,
          headers: request.headers,
        },
        response: response,
        meta: meta,
        created: moment().format('YYYY-MM-DD HH:mm:ss'),
      };
      logMessage(JSON.stringify(logData.request));
      logMessage(JSON.stringify(logData.response));
      return true;
    } catch (error) {
      logError(`Unable to log api request !! ${JSON.stringify(error)}`);
      return false;
    }
  }
}

import { Injectable } from '@nestjs/common';
import * as moment from 'moment-timezone';
import { logMessage, logError } from './custom-logger';

@Injectable()
export class TpApiLogService {
  async save(request: any, response: any): Promise<boolean> {
    try {
      const logData = {
        request: {
          url: request.url,
          method: request.method,
          params: request.params,
          body: request.data,
          headers: request.headers,
        },
        response: {
          statusCode: response.status,
          data: response?.data,
        },
        created: moment().format('YYYY-MM-DD HH:mm:ss'),
      };
      logMessage(JSON.stringify(logData.request));
      logMessage(JSON.stringify(logData.response));
      return true;
    } catch (error) {
      logError(`Unable to log api request !! ${JSON.stringify(error)}`);
    }
  }
}

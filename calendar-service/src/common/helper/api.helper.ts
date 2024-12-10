import { v4 } from 'uuid';
import { Injectable, Logger, RequestMethod } from '@nestjs/common';
import axios from 'axios';
import { TpApiLogService } from 'src/logger/tp-api-log';

@Injectable()
export class ApiHelperService {
  constructor(private tpApiLog: TpApiLogService) {}
  private readonly logger = new Logger('TP_API_LOG');
  async httpRequest(requestParams: any): Promise<any> {
    try {
      const request: any = {
        url: requestParams.url,
        method:
          RequestMethod[requestParams.method] ||
          RequestMethod[RequestMethod.POST],
        data: requestParams.body ? requestParams.body : {},
        params: requestParams.query ? requestParams.query : {},
        headers: requestParams.headers
          ? requestParams.headers
          : { 'Content-Type': 'application/json' },
        timeout: requestParams.timeout ? requestParams.timeout : 5000,
      };
      request.headers = {
        ...request.headers,
        ...{ 'x-correlation-id': v4() },
      };
      let response = {};
      try {
        response = await axios.request(request);
      } catch (errorResponse) {
        response = errorResponse?.response;
      }
      this.tpApiLog.save(request, response);
      return response;
    } catch (error) {
      this.logger.error(requestParams, error);
    }
  }
}

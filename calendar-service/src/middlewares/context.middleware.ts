import { v4 } from 'uuid';
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import asyncLocalStorage from 'src/common/context/local-storage';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger('API_LOG');
  async use(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    const startAt = process.hrtime();
    const map = new Map();
    const relationId = v4();
    map.set('x-correlation-id', relationId);
    const { ip, method, originalUrl } = request;
    response.on('finish', async () => {
      const { statusCode } = response;
      const diff = process.hrtime(startAt);
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6;
      if (originalUrl != '/health') {
        this.logger.log(
          `${method} ${originalUrl} ${statusCode} ${Math.round(
            responseTime,
          )}ms ${ip} | ${relationId}`,
        );
      }
    });
    asyncLocalStorage.run(map, () => next());
  }
}

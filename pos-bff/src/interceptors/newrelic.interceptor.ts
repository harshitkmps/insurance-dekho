/* eslint-disable @typescript-eslint/no-var-requires */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class NewrelicInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (this.configService.get("NEW_RELIC_ENABLED") !== "true") {
      return next.handle();
    }
    const newrelic = require("newrelic");
    const request = context.switchToHttp().getRequest();

    // Set a custom transaction name based on the route
    const transactionName = `${request.method} ${request.route.path}`;
    newrelic.setTransactionName(transactionName);
    return newrelic.startWebTransaction(context.getHandler().name, function () {
      const transaction = newrelic.getTransaction();
      // const now = Date.now();
      return next.handle().pipe(
        tap(() => {
          return transaction.end();
        }),
        catchError(() => {
          return transaction.end();
        })
      );
    });
  }
}

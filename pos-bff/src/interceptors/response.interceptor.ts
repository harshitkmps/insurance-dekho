import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Scope,
} from "@nestjs/common";
import { Observable, catchError, map } from "rxjs";

@Injectable({ scope: Scope.REQUEST })
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => data),
      catchError((err) => err)
    );
  }
}

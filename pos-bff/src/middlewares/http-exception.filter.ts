import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    Logger.log("inside error middleware....");
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    try {
      const status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();
      const message: string =
        exceptionResponse?.message ||
        exceptionResponse ||
        "Something went wrong";
      // eslint-disable-next-line no-console
      console.error(
        `[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`
      );
      Logger.error(
        `[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`
      );
      return res.status(status).json({ message });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "something went wrong!!!" });
    }
  }
}

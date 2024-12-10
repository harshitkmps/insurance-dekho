import { NextFunction, Request, Response } from "express";
import { HttpException } from "@exceptions/HttpException";
import { logger } from "@utils/logger";

const errorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info("inside error middleware....");
    const status: number = error.status || 500;
    const message: string = error.message || "Something went wrong";

    console.error(
      `[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`
    );
    logger.error(
      `[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`
    );
    res.status(status).json({ message });
  } catch (error) {
    // next(error);
    return new HttpException(500, "something went wrong!!!");
  }
};

export default errorMiddleware;

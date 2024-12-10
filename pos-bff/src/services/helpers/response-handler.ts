import { ApiResponse } from "../../dtos/response/api-response";
import { Request, Response } from "express";
import ContextHelper from "./context-helper";

const sendResponse = (
  request: Request,
  response: Response,
  statusCode: number,
  message: string,
  responseBody: any
) => {
  const res = new ApiResponse(statusCode, message, responseBody);
  return ContextHelper.exit(() => response.status(statusCode).json(res));
};

export { sendResponse };

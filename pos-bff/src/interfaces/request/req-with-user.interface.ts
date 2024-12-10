import { Request } from "express";

export interface ReqWithUser extends Request {
  userInfo?: any;
}

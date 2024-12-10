import { NextFunction, Request, Response } from "express";
import { HttpException } from "@exceptions/HttpException";
import { logger } from "@/utils/logger";
import apiHelper from "../services/helpers/common-api-helper";
import Container from "typedi";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.debug("request received ", req);
    const payload = await decodeJWTFromReq(req);
    logger.info("payload : ", { payload: payload });
    const uuid = payload.data.uuid;
    const mobile = payload.data.mobile;
    const email = payload.data.email;
    logger.info(
      `user detail iam_id : ${uuid} mobile : ${mobile} email : ${email}`
    );
    const userInfo = await getUserInfo(req);
    req.body.userInfo = userInfo;
  } catch (error) {
    next(new HttpException(401, "user not authenticated"));
  }
  next();
};

async function decodeJWTFromReq(req: Request) {
  const token = req.headers.authorization.split(" ")[1];
  logger.info("decoding jwt token: " + token);
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const buff = Buffer.from(base64, "base64");
  const payloadinit = buff.toString("ascii");
  return JSON.parse(payloadinit);
}

async function getUserInfo(req: Request) {
  const headers = {
    Authorization: req.header("Authorization"),
  };
  const options = {
    endpoint: process.env.API_POS_ENDPOINT + "/v1/user-info",
    method: "GET",
    config: {
      headers: headers,
    },
  };
  const commonApiHelper = Container.get(apiHelper);
  const userResponse = await commonApiHelper.getData(options, {});
  logger.info("user response received ", userResponse);
  if (userResponse && userResponse["status"] === 200) {
    return userResponse["data"]["user_basic_info"];
  }
  throw new HttpException(401, "no details found for user in pos");
}

export default authMiddleware;

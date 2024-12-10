import { Service } from "typedi";
import { logger } from "@/utils/logger";
import { channel } from "@/config/rabbitMq";
import UploadParentReq from "@/models/mongo/upload-parent-req.schema";

@Service()
export default class UploadHitProducer {
  public async produceParentHit(
    apiConfig: any,
    file: any,
    body: any,
    headers: any
  ): Promise<any> {
    const queue = process.env.RABBIT_MQ_UPLOAD_PARENT_QUEUE;
    logger.info("Writing to queue", {
      queueName: queue,
    });
    const data = body.data;
    const parentReqData: any = {
      userEmail: body.email,
      iamUuid: body.uuid,
      source: body.source,
      requestFileLink: file,
      data,
      apiConfig: apiConfig.configValue,
      type: body.type,
      requestParams: body.apiParams,
    };

    const parentReq = new UploadParentReq(parentReqData);
    const parentReqLog = await parentReq.save();
    logger.info("parent req data saved for state produced ", {
      id: parentReqData._id,
      email: body.email,
      type: body.type,
      headers,
    });
    const queueMsg = JSON.stringify({
      ...parentReqData,
      headers,
      id: parentReqLog._id,
    });
    channel.sendToQueue(queue, Buffer.from(queueMsg), { persistent: true });
    return {
      message: "You will receive an email when the data is ready",
      parentReqId: parentReqLog._id,
    };
  }
}

import { Message } from "amqplib";
import Container from "typedi";
import { logger } from "@/utils/logger";
import { channel } from "@/config/rabbitMq";
import CommonUtils from "@/utils/common-utils";
import GstDetailsParentReq from "@/models/mongo/gst-details-parent-req.schema";
import PosApiService from "../pos-api-service";
import { GST_QUEUE_STATUS } from "@/constants/gst.constants";
import { HTTP_STATUS_CODE } from "@/constants/http.constants";

const posApiService = Container.get(PosApiService);

const gcdDataConsumer = async (msg: Message, queue: string): Promise<any> => {
  const queueMsg = JSON.parse(msg.content.toString());
  try {
    logger.info("Message received in gcd consumer ", { queueMsg });
    await CommonUtils.delay(1000);

    const reqId = queueMsg.id;
    const gstReqData = await GstDetailsParentReq.findById(reqId);
    const gstResponse = await posApiService.getGstData(gstReqData);
    if (gstResponse.status === HTTP_STATUS_CODE.OK) {
      let responseObj = {};
      if (gstResponse?.data?.length) {
        let gstNumber = "";
        for (const response of gstResponse.data) {
          gstNumber += response.gstNumber + ",";
        }
        gstNumber = gstNumber.slice(0, -1);
        responseObj = {
          gcdCode: gstReqData.gcdCode,
          iamUuid: gstReqData.iamUuid,
          pan: gstReqData.pan,
          gstNumber: gstNumber,
        };
        logger.info(`response object `, responseObj);
      }
      await GstDetailsParentReq.findByIdAndUpdate(reqId, {
        status: GST_QUEUE_STATUS.COMPLETED,
        response: responseObj,
      });
    }
    if (gstResponse.status !== HTTP_STATUS_CODE.OK && gstReqData.hitCount < 3) {
      await GstDetailsParentReq.findByIdAndUpdate(reqId, {
        status: GST_QUEUE_STATUS.FAILED,
        hitCount: gstReqData.hitCount + 1,
      });
      const newQueueMsg = JSON.stringify({
        ...queueMsg,
        hitCount: gstReqData.hitCount + 1,
      });
      channel.sendToQueue(queue, Buffer.from(newQueueMsg), {
        persistent: true,
      });
    }

    channel.ack(msg);
    logger.info("acknowledged gcd consumer queue");
  } catch (err) {
    const error = CommonUtils.isJsonString(err);
    logger.error("error while consuming gcd consumer", {
      error,
      id: queueMsg.id,
    });
    channel.nack(msg, false, false);
  }
};

export { gcdDataConsumer };

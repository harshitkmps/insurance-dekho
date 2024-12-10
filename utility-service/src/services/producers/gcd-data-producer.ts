import { Service } from "typedi";
import { logger } from "@/utils/logger";
import { channel } from "@/config/rabbitMq";
import GstDetailsParentReq from "@/models/mongo/gst-details-parent-req.schema";
import { GST_QUEUE_STATUS } from "@/constants/gst.constants";
@Service()
export default class GcdDataProducer {
  public async produceGcdData(
    iamUuid: string,
    gcdCode: string,
    pan: string
  ): Promise<any> {
    const queue = process.env.GCD_DATA_QUEUE;
    logger.info("Writing to queue", {
      queueName: queue,
    });
    const gstDetailsReqData: any = {
      iamUuid: iamUuid,
      gcdCode: gcdCode,
      pan: pan,
      status: GST_QUEUE_STATUS.PRODUCED,
      hitCount: 0,
    };

    const gstDetailsReq = new GstDetailsParentReq(gstDetailsReqData);
    const gstDetailsReqLog = await gstDetailsReq.save();
    logger.info("gst req data saved for state produced ", {
      id: gstDetailsReqLog._id,
    });
    const queueMsg = JSON.stringify({
      id: gstDetailsReqLog._id,
      iamUuid,
    });
    channel.sendToQueue(queue, Buffer.from(queueMsg), { persistent: true });
    return { message: "You will receive an email when the data is ready" };
  }
}

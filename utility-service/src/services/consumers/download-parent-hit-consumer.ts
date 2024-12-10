import { Message } from "amqplib";
import moment from "moment";
import _ from "lodash";
import { channel } from "@/config/rabbitMq";
import DownloadChildReq from "@/models/mongo/download-child-req.schema";
import { logger } from "@/utils/logger";
import CommonUtils from "@/utils/common-utils";
import DataModificationUtils from "@/utils/data-modification-utils";
import DownloadParentReq from "@/models/mongo/download-parent-req.schema";

const parentHitConsumer = async (msg: Message): Promise<void> => {
  try {
    const queueMsg = JSON.parse(msg.content.toString());
    logger.info("Message received in parent hit consumer", {
      queueMsg,
    });

    const parentReq = await DownloadParentReq.findById(queueMsg.id).lean();

    const apiReqParams = parentReq.requestParams.filterParams;
    const configDetails = parentReq.requestParams.apiDetails;
    apiReqParams.limit = configDetails.limit;

    const parentStartDate = moment(
      _.get(apiReqParams, configDetails.startDatePath)
    );
    const parentEndDate = moment(
      _.get(apiReqParams, configDetails.endDatePath)
    );

    let splitDateRange: any;
    if (configDetails.dayWise) {
      splitDateRange = DataModificationUtils.splitDatesDayWise(
        parentStartDate,
        parentEndDate
      );
    } else {
      splitDateRange = DataModificationUtils.splitDatesOnCount(
        parentStartDate,
        parentEndDate,
        configDetails.parallelCount || 1
      );
    }

    const dateRanges: any[] = splitDateRange.dateRanges;
    for (const [index, dateRange] of dateRanges.entries()) {
      const updatedApiReqParams = {
        ...apiReqParams,
        medium: parentReq.requestSource,
      };

      if (_.get(apiReqParams, configDetails?.startDatePath)) {
        _.set(
          updatedApiReqParams,
          configDetails?.startDatePath,
          dateRange.startDate
        );
      }
      if (_.get(apiReqParams, configDetails?.startDatePath)) {
        _.set(
          updatedApiReqParams,
          configDetails?.endDatePath,
          dateRange.endDate
        );
      }
      const childApiReqData = new DownloadChildReq({
        parentReqId: queueMsg.id,
        sequenceNo: 1,
        parallelChildSequenceNo: index + 1,
        requestParams: updatedApiReqParams,
      });

      const childApiReqLog = await childApiReqData.save();
      const id = childApiReqLog._id;

      logger.info("download child req data saved for state produced", {
        id,
        parentReqId: queueMsg.id,
        type: queueMsg.type,
      });

      const childQueueMsg = JSON.stringify({
        id,
        parentReqId: queueMsg.id,
        sequenceNo: 1,
        parallelChildSequenceNo: index + 1,
        hitCount: 0,
        type: queueMsg.type,
        name: queueMsg.name,
        parallelCount: dateRanges.length,
      });

      channel.publish(
        process.env.RABBIT_MQ_DOWNLOAD_CHILD_EXCHANGE,
        process.env.RABBIT_MQ_DOWNLOAD_CHILD_ROUTING_KEY,
        Buffer.from(childQueueMsg),
        { headers: { "x-delay": 5000 }, persistent: true }
      );
    }
    logger.info("acknowledged parent hit consumer queue");
    channel.ack(msg);
  } catch (err) {
    const error = CommonUtils.isJsonString(err);
    logger.error("error while consuming parent hit consumer", { error });
    channel.nack(msg, false, false);
  }
};

export { parentHitConsumer };

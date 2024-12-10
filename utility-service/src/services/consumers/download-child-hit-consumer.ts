import { Message } from "amqplib";
import Container from "typedi";
import { logger } from "@/utils/logger";
import LmwService from "@services/lmw-service";
import { channel } from "@/config/rabbitMq";
import DownloadChildReq from "@/models/mongo/download-child-req.schema";
import {
  CHILD_API_STATUS,
  PARENT_API_STATUS,
} from "@/constants/download.constants";
import CommonUtils from "@/utils/common-utils";
import _ from "lodash";
import PosBffService from "@services/pos-bff-service";
import DownloadParentReq from "@/models/mongo/download-parent-req.schema";
import DownloadService from "../download-service";

const lmwService = Container.get(LmwService);
const posBffService = Container.get(PosBffService);
const downloadService = Container.get(DownloadService);

const childApiHitConsumer = async (msg: Message): Promise<any> => {
  const queueMsg = JSON.parse(msg.content.toString());
  try {
    logger.info("Message received in child api hit consumer ", { queueMsg });
    const [parentReq, childReq] = await Promise.all([
      DownloadParentReq.findById(queueMsg.parentReqId).lean(),
      DownloadChildReq.findById(queueMsg.id).lean(),
    ]);

    const configDetails = parentReq.requestParams.apiDetails;

    const {
      nextCursorKey,
      apiResNextCursorPath,
      nextCursorPath,
      method,
      apiResDataPath,
      dataStoreType,
      headers = {},
    } = configDetails;

    if (parentReq.status === PARENT_API_STATUS.FAILED) {
      // Parent req has been marked as failed
      const updatedParentReq = await downloadService.markChildComplete(
        queueMsg.id,
        queueMsg.parentReqId,
        CHILD_API_STATUS.FAILED
      );

      if (updatedParentReq.childCompletedCount === queueMsg.parallelCount) {
        downloadService.pushToAccumulator(queueMsg, dataStoreType);
      }
      return channel.ack(msg);
    }

    const options = {
      endpoint: parentReq.api,
      method,
      config: {
        headers: { ...parentReq.requestParams.headers, ...headers },
      },
    };
    let apiRes = null;
    if (queueMsg.type === "cases") {
      apiRes = await lmwService.getCaseListingData(
        options,
        childReq.requestParams
      );
    } else {
      apiRes = await posBffService.getLeadsData(
        options,
        childReq.requestParams
      );
    }

    const { response, err } = apiRes;
    logger.info("child api response recevied", {
      parentReqId: queueMsg.parentReqId,
    });
    const updatedObj = {
      hitCount: queueMsg.hitCount + 1,
      status: CHILD_API_STATUS.COMPLETED,
      apiResponse: response,
    };

    if (!response) {
      updatedObj.status = CHILD_API_STATUS.FAILED;
      updatedObj.apiResponse = err;
    }
    await DownloadChildReq.findByIdAndUpdate(queueMsg.id, updatedObj);
    logger.debug("updated child api req log", {
      id: queueMsg.id,
      status: updatedObj.status,
    });
    if (_.get(response, nextCursorPath)) {
      const updatedReqParams = { ...childReq.requestParams };
      updatedReqParams[nextCursorKey] = _.get(response, apiResNextCursorPath);

      const childApiReqData = new DownloadChildReq({
        parentReqId: queueMsg.parentReqId,
        sequenceNo: queueMsg.sequenceNo + 1,
        parallelChildSequenceNo: queueMsg.parallelChildSequenceNo,
        requestParams: updatedReqParams,
      });
      const childApiReqLog = await childApiReqData.save();
      const newQueueMsg = {
        ...queueMsg,
        hitCount: 0,
        sequenceNo: queueMsg.sequenceNo + 1,
        id: childApiReqLog._id,
      };
      logger.info("updated download child req data saved", {
        id: childApiReqLog._id,
        type: queueMsg.type,
      });
      channel.publish(
        process.env.RABBIT_MQ_DOWNLOAD_CHILD_EXCHANGE,
        process.env.RABBIT_MQ_DOWNLOAD_CHILD_ROUTING_KEY,
        Buffer.from(JSON.stringify(newQueueMsg)),
        { headers: { "x-delay": 5000 }, persistent: true }
      );
      return channel.ack(msg);
    }

    if (
      updatedObj.status === CHILD_API_STATUS.FAILED &&
      updatedObj.hitCount < 3
    ) {
      const newQueueMsg = { ...queueMsg, hitCount: updatedObj.hitCount };
      channel.publish(
        process.env.RABBIT_MQ_DOWNLOAD_CHILD_EXCHANGE,
        process.env.RABBIT_MQ_DOWNLOAD_CHILD_ROUTING_KEY,
        Buffer.from(JSON.stringify(newQueueMsg)),
        {
          headers: {
            "x-delay": process.env.RETRY_DELAY
              ? Number(process.env.RETRY_DELAY) * updatedObj.hitCount
              : 5000,
          },
          persistent: true,
        }
      );

      return channel.ack(msg);
    }

    if (
      updatedObj.status === CHILD_API_STATUS.FAILED &&
      updatedObj.hitCount >= 3
    ) {
      const updatedParentReq = await DownloadParentReq.findByIdAndUpdate(
        queueMsg.parentReqId,
        {
          status: PARENT_API_STATUS.FAILED,
          $inc: { childCompletedCount: 1 },
        }
      );
      logger.error(`API failed in ${queueMsg.sequenceNo} sequence`, {
        parentReqId: queueMsg.parentReqId,
      });
      if (updatedParentReq.childCompletedCount === queueMsg.parallelCount) {
        downloadService.pushToAccumulator(queueMsg, dataStoreType);
      }
      return channel.ack(msg);
    }

    if (!_.get(response, nextCursorPath)) {
      const updateParams = {
        $inc: { childCompletedCount: 1 },
      };
      const parentReqLog = await DownloadParentReq.findByIdAndUpdate(
        queueMsg.parentReqId,
        updateParams,
        { new: true }
      ).lean();

      if (parentReqLog.childCompletedCount === queueMsg.parallelCount) {
        downloadService.pushToAccumulator(queueMsg, dataStoreType);
      }
      logger.info("acknowledged child hit consumer queue");
      return channel.ack(msg);
    }
    if (
      queueMsg.sequenceNo === 1 &&
      updatedObj.status === CHILD_API_STATUS.COMPLETED &&
      !_.get(response, apiResDataPath)?.length
    ) {
      await DownloadParentReq.findByIdAndUpdate(queueMsg.parentReqId, {
        status: PARENT_API_STATUS.COMPLETED,
      });
      logger.info("empty array received for first sequence child API", {
        parentReqId: queueMsg.parentReqId,
      });
      return channel.ack(msg);
    }

    channel.ack(msg);
  } catch (err) {
    const error = CommonUtils.isJsonString(err);
    logger.error("error while consuming child hit consumer", {
      error,
      parentReqId: queueMsg.parentReqId,
      id: queueMsg.id,
    });
    channel.nack(msg, false, false);
  }
};

export { childApiHitConsumer };

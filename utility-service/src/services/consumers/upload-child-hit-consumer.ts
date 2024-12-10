import { Message } from "amqplib";
import Container from "typedi";
import { logger } from "@/utils/logger";
import { channel } from "@/config/rabbitMq";
import {
  CHILD_API_STATUS,
  DEFAULT_RETRY_DELAY,
} from "@/constants/upload.constants";
import CommonUtils from "@/utils/common-utils";
import ChildConsumerHelper from "../helpers/upload/child-consumer-helper";
import UploadChildReq from "@/models/mongo/upload-child-req.schema";

const childConsumerHelper = Container.get(ChildConsumerHelper);

const uploadChildApiHitConsumer = async (msg: Message): Promise<any> => {
  const queueMsg = JSON.parse(msg.content.toString());
  try {
    const {
      config,
      requestParams,
      hitCount,
      id,
      headers: queueMsgHeaders,
    } = queueMsg;
    logger.info(
      `Message received in upload child api hit consumer with id :${id}`
    );

    const {
      method,
      apiEndpoint,
      headers: configHeaders,
      maxRetryCount: configMaxRetryCount,
      retryDelay,
    } = config;
    const headers = {
      authorization: queueMsgHeaders?.authorization,
      ...(configHeaders ?? {}),
    };
    const options = {
      endpoint: apiEndpoint,
      method,
      config: {
        headers,
      },
    };
    const apiResponse = await childConsumerHelper.fetchDataFromExternalService(
      requestParams,
      options
    );

    const { response, error } = apiResponse;

    const updatedMessage = {
      hitCount: hitCount + 1,
    };

    const maxRetryCount =
      parseInt(configMaxRetryCount) ||
      parseInt(process.env.UPLOAD_MAX_RETRY_COUNT);

    if (error) {
      logger.error(`error occurred in upload child consumer ${id} ${hitCount}`);
      //failed status -> retry count = maxRetryCount
      updatedMessage["apiResponse"] = error;
      if (hitCount === maxRetryCount) {
        updatedMessage["status"] = CHILD_API_STATUS.FAILED;
        await UploadChildReq.findByIdAndUpdate(id, updatedMessage);
      }
      //retry status -> retry count < maxRetryCount
      if (hitCount < maxRetryCount) {
        updatedMessage["status"] = CHILD_API_STATUS.RETRY;
        await UploadChildReq.findByIdAndUpdate(id, updatedMessage);
        const repushedChildMessage = {
          ...queueMsg,
          ...updatedMessage,
        };

        const routingKey =
          process.env.RABBIT_MQ_UPLOAD_RETRY_CHILD_QUEUE_ROUTING_KEY;
        const exchange = process.env.RABBIT_MQ_UPLOAD_ORCHESTRATOR_EXCHANGE;
        const delay =
          (parseInt(retryDelay) || DEFAULT_RETRY_DELAY) * (hitCount + 1);
        channel.publish(
          exchange,
          routingKey,
          Buffer.from(JSON.stringify(repushedChildMessage)),
          {
            headers: {
              "x-delay": delay,
            },
            persistent: true,
          }
        );
      }
    }

    //success status
    if (response) {
      await childConsumerHelper.handleMessageSuccess(queueMsg, response);
    }

    channel.ack(msg);
    logger.info(`acknowledged upload child hit consumer queue with id: ${id}`);
  } catch (err) {
    const error = CommonUtils.isJsonString(err);
    logger.error("error while consuming child hit consumer", {
      error,
      parentReqId: queueMsg?.parentRequestId,
      id: queueMsg?.id,
    });
    channel.nack(msg, false, false);
  }
};

export { uploadChildApiHitConsumer };

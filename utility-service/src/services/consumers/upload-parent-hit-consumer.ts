import { Message } from "amqplib";
import { channel } from "@/config/rabbitMq";
import { logger } from "@/utils/logger";
import CommonUtils from "@/utils/common-utils";
import Container from "typedi";
import ConsumerHelper from "../helpers/upload/consumer-helper";
import UploadParentReq from "@/models/mongo/upload-parent-req.schema";
import { PARENT_API_STATUS } from "@/constants/upload.constants";
import CommunicationService from "../communication-service";

const uploadParentConsumerHelper = Container.get(ConsumerHelper);
const communicationService = Container.get(CommunicationService);

const uploadParentHitConsumer = async (msg: Message): Promise<any> => {
  try {
    const queueMsg = JSON.parse(msg.content.toString());
    logger.info("Message received in upload parent hit consumer ", {
      queueMsg,
    });
    const config = queueMsg.apiConfig;
    const apiParams = queueMsg.requestParams;
    const type = queueMsg.type;
    const parentMongoId = queueMsg.id;
    const headers = queueMsg.headers ?? {};
    const email = queueMsg.userEmail;
    const uploadFileData = await uploadParentConsumerHelper.getDataFromMessage(
      queueMsg
    );

    //pre processing configs to reduce the load on minor gc
    const sheetNames = Object.keys(uploadFileData);
    const preProccesedConfig = uploadParentConsumerHelper.preProcessConfigs(
      config,
      sheetNames
    );

    //data modification layer
    await uploadParentConsumerHelper.dataModificationLayer(
      uploadFileData,
      config,
      preProccesedConfig
    );

    //nothing to process if uploadFile data is empty
    if (!Object.keys(uploadFileData)?.length) {
      const message = `Received following sheets: <b> ${sheetNames.toString()} </b> 
      <br>
      File should contains atleast one of the following sheets: 
      <b>
        ${(config?.allowedSheets ?? []).toString()}
      </b>
      `;

      logger.error("sending error mail for ", { parentMongoId });
      await communicationService.sendRequestFailedEmail(
        message,
        email,
        "Upload"
      );
      await UploadParentReq.findByIdAndUpdate(parentMongoId, {
        status: PARENT_API_STATUS.FAILED,
      });
      channel.ack(msg);
      return;
    }

    //group them by sequence number/
    uploadParentConsumerHelper.groupRows(uploadFileData, preProccesedConfig);

    //create child messages and push them into the queue
    for (const sheetName in uploadFileData) {
      const rows = uploadFileData[sheetName];
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        await uploadParentConsumerHelper.createChildMessage(
          rows[rowIndex],
          apiParams,
          preProccesedConfig,
          sheetName,
          parentMongoId,
          type,
          config,
          headers,
          rowIndex
        );
      }
    }

    //create accumulator message and push it into the queue
    logger.info(`creating accumulator message for`, { parentMongoId });
    await uploadParentConsumerHelper.createAccumulatorMessage(queueMsg);
    channel.ack(msg);
    logger.info("acknowledged parent hit consumer queue");
  } catch (err) {
    const error = CommonUtils.isJsonString(err);
    logger.error("error while consuming parent hit consumer", { error });
    channel.nack(msg, false, false);
  }
};

export { uploadParentHitConsumer };

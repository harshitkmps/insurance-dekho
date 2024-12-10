import { Message } from "amqplib";
import Container from "typedi";
import { logger } from "@/utils/logger";
import { channel } from "@/config/rabbitMq";
import {
  CHILD_API_STATUS,
  PARENT_API_STATUS,
} from "@/constants/upload.constants";
import CommonUtils from "@/utils/common-utils";
import UploadChildReq from "@/models/mongo/upload-child-req.schema";
import UploadFileFacade from "@/facades/upload-file.facade";
import UploadService from "../upload-service";
import AccumulatorConsumerHelper from "../helpers/upload/accumulator-helper";
import UploadParentReq from "@/models/mongo/upload-parent-req.schema";

const uploadFileFacade = Container.get(UploadFileFacade);
const uploadService = Container.get(UploadService);
const accumulatorConsumerHelper = Container.get(AccumulatorConsumerHelper);

const uploadAccumulatorHitConsumer = async (msg: Message): Promise<any> => {
  const queueMsg = JSON.parse(msg.content.toString());
  try {
    const { apiConfig: config, hitCount, id, userEmail } = queueMsg;

    const query = {
      parentRequestId: id,
      $or: [
        { status: CHILD_API_STATUS.PRODUCED },
        { status: CHILD_API_STATUS.RETRY },
      ],
    };

    const docFetchingQuery = {
      parentRequestId: id,
      status: {
        $in: [CHILD_API_STATUS.COMPLETED, CHILD_API_STATUS.RETRY],
      },
    };

    await CommonUtils.delay(3000);
    const count = await UploadChildReq.countDocuments(query);

    if (count !== 0) {
      //re-push
      const accumulatorMessage = JSON.stringify({
        ...queueMsg,
        hitCount: hitCount + 1,
      });
      channel.publish(
        process.env.RABBIT_MQ_UPLOAD_ACCUMULATOR_EXCHANGE,
        process.env.RABBIT_MQ_UPLOAD_ACCUMULATOR_ROUTING_KEY,
        Buffer.from(accumulatorMessage),
        { headers: { "x-delay": 10000 }, persistent: true }
      );
    }
    if (count === 0) {
      logger.info(`Accumulating upload accumulator ${id}`);
      const documents = await UploadChildReq.find(docFetchingQuery, {
        _id: 0,
        apiResponse: 1,
        sheetName: 1,
      }).lean();

      const groupedDocument = {};

      for (
        let documentIndex = 0;
        documentIndex < documents.length;
        documentIndex++
      ) {
        const document = documents[documentIndex];
        if (!groupedDocument[document.sheetName]?.length) {
          groupedDocument[document.sheetName] = [];
        }
        groupedDocument[document.sheetName].push(document.apiResponse);
      }

      const filePath = await uploadFileFacade.dataToFile(
        groupedDocument,
        config?.responseDataStoreType ?? config?.dataStoreType,
        config
      );
      const { signedUrl, unsignedUrl } = await uploadService.uploadFileToS3(
        filePath
      );
      await CommonUtils.unSyncFile(filePath);
      const response = await accumulatorConsumerHelper.sendMail(
        signedUrl,
        userEmail,
        config
      );
      if (response?.status === "T") {
        await UploadParentReq.findByIdAndUpdate(
          id,
          {
            status: PARENT_API_STATUS.COMPLETED,
            responseFileLink: unsignedUrl,
          },
          { new: true }
        );
      } else {
        await UploadParentReq.findByIdAndUpdate(
          id,
          {
            status: PARENT_API_STATUS.FAILED,
          },
          { new: true }
        );
      }
    }
    channel.ack(msg);
    logger.info(
      `acknowledged upload accumulator hit consumer queue with id: ${id}`
    );
  } catch (err) {
    const error = CommonUtils.isJsonString(err);
    logger.error("error while consuming upload accumulator hit consumer", {
      error,
      parentReqId: queueMsg?.parentRequestId,
      id: queueMsg?.id,
    });
    channel.nack(msg, false, false);
  }
};

export { uploadAccumulatorHitConsumer };

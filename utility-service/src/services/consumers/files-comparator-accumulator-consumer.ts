import { channel } from "@/config/rabbitMq";
import ComparatorChildReq from "@/models/mongo/comparator-child-req.schema";
import CommonUtils from "@/utils/common-utils";
import { logger } from "@/utils/logger";
import { Message } from "amqplib";
import Container from "typedi";
import { FileService } from "../file-service";
import ComparatorParentReq from "@/models/mongo/comparator-parent-req.schema";
import UploadService from "../upload-service";
import CommunicationService from "../communication-service";
import { HTTP_STATUS_CODE } from "@/constants/http.constants";
import { COMPARATOR_PARENT_STATUS } from "@/constants/files-comparator.constants";
import {
  ComparatorMailVariables,
  ComparatorStats,
} from "@/interfaces/comparator-accumulator.interface";

const fileService = Container.get(FileService);
const uploadService = Container.get(UploadService);
const communicationService = Container.get(CommunicationService);

const filesComparatorAccumulatorConsumer = async (
  msg: Message
): Promise<void> => {
  const queueMsg = JSON.parse(msg.content.toString());
  try {
    await CommonUtils.delay(1000);
    logger.info("consuming files comparator accumulator consumer", {
      queueMsg,
    });
    const parentReq = await ComparatorParentReq.findById(queueMsg.id).lean();
    const statsArr = await ComparatorChildReq.aggregate([
      { $match: { parentReqId: queueMsg.id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const stats: ComparatorStats = {
      MATCHED: 0,
      UNMATCHED: 0,
      MISMATCHED: 0,
      VALIDATION_FAILED: 0,
    };

    for (const stat of statsArr) {
      stats[stat._id] = stat.count;
    }

    logger.info("stats = ", { stats, id: queueMsg.id });

    const config = parentReq.configDetails;
    const totalErrorCount =
      stats.UNMATCHED + stats.MISMATCHED + stats.VALIDATION_FAILED;

    const fileName = fileService.createFileName(
      parentReq.configDetails.fileName
    );

    const comparisonColumnMap = {};
    for (const column of config.comparisonColumn.file1) {
      comparisonColumnMap[column] = column;
    }
    const csvHeadings = {
      ...comparisonColumnMap,
      status: "Status",
      errorDetails: "Error Details",
    };

    const { filePath } = await fileService.createFileAndHeadings(
      queueMsg.type,
      fileName,
      csvHeadings,
      config.dataStoreType
    );

    await fileService.prepareCsvComparatorReport(
      totalErrorCount,
      queueMsg,
      config,
      filePath,
      csvHeadings
    );

    const { signedUrl, unsignedUrl } = await uploadService.uploadFileToS3(
      filePath
    );
    await fileService.removeFile(filePath);

    const mailVariables: ComparatorMailVariables = {
      link: signedUrl,
      email: parentReq.email,
      name: queueMsg.name,
      ...stats,
    };

    const body = communicationService.prepareComparatorMailVariables(
      mailVariables,
      config.template
    );

    const res = await communicationService.sendEmail(body);

    const status =
      res.statusCode === HTTP_STATUS_CODE.OK
        ? COMPARATOR_PARENT_STATUS.COMPLETED
        : COMPARATOR_PARENT_STATUS.FAILED;
    await ComparatorParentReq.findByIdAndUpdate(queueMsg.id, {
      status,
      responseFile: unsignedUrl,
    });
    if (status === COMPARATOR_PARENT_STATUS.FAILED) {
      logger.info("nacknowledged file comparator accumulator queue");
      return channel.nack(msg, false, false);
    }
    channel.ack(msg);
    logger.info("acknowledged file comparator accumulator queue");
  } catch (err) {
    const error = CommonUtils.isJsonString(err);
    logger.error("file comparator accumulator consumer error", { error });
    channel.nack(msg, false, false);
  }
};

export { filesComparatorAccumulatorConsumer };

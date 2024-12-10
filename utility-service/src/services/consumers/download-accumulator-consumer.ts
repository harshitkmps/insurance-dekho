import { Message } from "amqplib";
import { channel } from "@/config/rabbitMq";
import { logger } from "@/utils/logger";
import { PARENT_API_STATUS } from "@/constants/download.constants";
import CommonUtils from "@/utils/common-utils";
import Container from "typedi";
import UploadService from "../upload-service";
import DownloadParentReq from "@/models/mongo/download-parent-req.schema";
import fs from "fs";
import { FileService } from "../file-service";
import { HTTP_STATUS_CODE } from "@/constants/http.constants";
import { IMailVariables } from "@/interfaces/download-helper-schema.interface";
import DownloadHelper from "../helpers/download-helper";
import DownloadChildReq from "@/models/mongo/download-child-req.schema";
import CommunicationService from "../communication-service";

const uploadService = Container.get(UploadService);
const fileService = Container.get(FileService);
const downloadHelper = Container.get(DownloadHelper);
const communicationService = Container.get(CommunicationService);

const accumulatorConsumer = async (msg: Message): Promise<any> => {
  const queueMsg = JSON.parse(msg.content.toString());
  try {
    logger.info("Message received in accumulator consumer ", {
      queueMsg,
    });
    const parentReq = await DownloadParentReq.findById(
      queueMsg.parentReqId
    ).lean();

    if (parentReq.status === PARENT_API_STATUS.FAILED) {
      const downloadType = CommonUtils.convertCamelToTitleCase(parentReq.type);
      const message = `<b>Some error has occurred while processing the ${downloadType}</b><br/>`;
      await communicationService.sendRequestFailedEmail(
        message,
        parentReq.userEmail,
        "Download"
      );
      return channel.ack(msg);
    }

    const totalDocs = await DownloadChildReq.countDocuments({
      parentReqId: queueMsg.parentReqId,
    });

    const configDetails = parentReq.requestParams.apiDetails;
    const fileName = fileService.createFileName(
      configDetails.fileName,
      parentReq.requestParams.filterParams
    );
    const totalFiles = configDetails.maxRowsInOneFile
      ? Math.ceil(
          (totalDocs * configDetails.limit) / configDetails.maxRowsInOneFile
        )
      : 1;
    let lastIndexUpdatedAt = null;
    const fileLinks = {
      unsigned: [],
      signed: [],
    };
    for (let i = 0; i < totalFiles; i += 1) {
      const { filePath } = await fileService.createFileAndHeadings(
        queueMsg.type,
        `${fileName}${totalFiles > 1 ? `_part_${i + 1}` : ""}`,
        configDetails.csvHeadings,
        configDetails.dataStoreType
      );

      const writtenRes = await fileService.accumulateDataAndWrite(
        configDetails.maxRowsInOneFile
          ? configDetails.maxRowsInOneFile / configDetails.limit
          : totalDocs,
        queueMsg,
        configDetails,
        filePath,
        lastIndexUpdatedAt
      );
      lastIndexUpdatedAt = writtenRes.lastIndexUpdatedAt;

      if (writtenRes.rowsWritten || totalFiles === 1) {
        const { signedUrl, unsignedUrl } = await uploadService.uploadFileToS3(
          filePath
        );
        fileLinks.signed.push(signedUrl);
        fileLinks.unsigned.push(unsignedUrl);
        logger.info("file uploaded to s3", {
          parentReqId: queueMsg.parentReqId,
        });
      }
      if (fs.existsSync(filePath)) {
        fs.promises.unlink(filePath);
      }
    }

    const customVariableFnParams: IMailVariables = {
      signedUrl: fileLinks.signed.join("<br/><br/>"),
      query: parentReq.requestParams.filterParams,
      name: queueMsg.name,
      email: parentReq.userEmail,
    };

    const res = await downloadHelper.sendEmail(
      customVariableFnParams,
      configDetails
    );
    const status =
      res?.statusCode === HTTP_STATUS_CODE.OK
        ? PARENT_API_STATUS.COMPLETED
        : PARENT_API_STATUS.FAILED;
    await DownloadParentReq.findByIdAndUpdate(queueMsg.parentReqId, {
      status,
      awsLink: fileLinks.unsigned,
    });
    if (status === PARENT_API_STATUS.FAILED) {
      logger.info("nacknowledged accumulator queue");
      return channel.nack(msg, false, false);
    }
    channel.ack(msg);
    logger.info("acknowledged accumulator queue");
  } catch (err) {
    const error = CommonUtils.isJsonString(err);
    logger.error("error while consuming accumulator consumer", {
      error,
      parentReqId: queueMsg.parentReqId,
    });
    channel.nack(msg, false, false);
  }
};

export { accumulatorConsumer };

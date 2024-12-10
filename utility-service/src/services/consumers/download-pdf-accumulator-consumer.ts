import { Message } from "amqplib";
import { channel } from "@/config/rabbitMq";
import { logger } from "@/utils/logger";
import { PARENT_API_STATUS } from "@/constants/download.constants";
import CommonUtils from "@/utils/common-utils";
import Container from "typedi";
import DownloadParentReq from "@/models/mongo/download-parent-req.schema";
import { FileService } from "../file-service";
import { HTTP_STATUS_CODE } from "@/constants/http.constants";
import { IMailVariables } from "@/interfaces/download-helper-schema.interface";
import DownloadHelper from "../helpers/download-helper";
import CentralDocumentService from "../central-document-service";

const downloadHelper = Container.get(DownloadHelper);
const fileService = Container.get(FileService);
const centralService = Container.get(CentralDocumentService);

const pdfAccumulatorConsumer = async (msg: Message): Promise<any> => {
  const queueMsg = JSON.parse(msg.content.toString());
  try {
    logger.info("Message received in pdf accumulator consumer ", {
      queueMsg,
    });
    const parentReq = await DownloadParentReq.findById(
      queueMsg.parentReqId
    ).lean();
    const configDetails = parentReq.requestParams.apiDetails;

    const childApiData = await fileService.accumulateData(
      queueMsg,
      configDetails,
      null
    );
    const geneartePDF = await centralService.generatePDF(childApiData);

    const documentIds = {
      doc_ids: [geneartePDF.data.doc_id],
    };
    const registerDocResp = await centralService.registerDoc(documentIds);
    const virtualDocId = registerDocResp?.data?.docs[0];

    const docServiceUrl =
      process.env.DOCUMENT_SERVICE_ENDPOINT + "/v1/documents/" + virtualDocId;
    const customVariableFnParams: IMailVariables = {
      signedUrl: docServiceUrl,
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
      awsLink: [docServiceUrl],
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

export { pdfAccumulatorConsumer };

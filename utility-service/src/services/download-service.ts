import { Inject, Service } from "typedi";
import { logger } from "@/utils/logger";
import UploadService from "./upload-service";
import DownloadHelper from "./helpers/download-helper";
import DownloadParentReq from "@/models/mongo/download-parent-req.schema";
import { channel } from "@/config/rabbitMq";
import moment from "moment";
import {
  DATA_STORAGE_TYPES,
  PARENT_API_STATUS,
} from "@/constants/download.constants";
import { IDownloadParentReq } from "@/interfaces/download-parent-req-schema.interface";
import { IMailVariables } from "@/interfaces/download-helper-schema.interface";
import DownloadChildReq from "@/models/mongo/download-child-req.schema";

@Service()
export default class DownloadService {
  @Inject()
  private uploadService: UploadService;
  @Inject()
  private downloadHelper: DownloadHelper;

  public async getDownloadData(
    body: any,
    params: any,
    configValue: any,
    bearerToken: string
  ): Promise<any> {
    logger.debug("in get download data service");
    const { message } = await this.produceParentHit(
      params,
      body,
      configValue,
      bearerToken
    );
    return message;
  }

  public async produceParentHit(
    endpoint: any,
    body: any,
    configValue: any,
    authorization: string
  ): Promise<any> {
    const queue = process.env.RABBIT_MQ_PARENT_HIT_QUEUE;
    logger.debug("Writing to queue", {
      queueName: queue,
    });
    const apiRequestParams = {
      filterParams: body.apiParams,
      apiDetails: configValue,
      headers: {
        authorization,
      },
    };

    const parentReqData: Partial<IDownloadParentReq> = {
      userEmail: body.email,
      iamUuid: body.uuid,
      requestSource: body.requestSource,
      api: `${configValue.domain}/${endpoint}`,
      type: `${body.type}Download`,
      requestParams: apiRequestParams,
    };

    const isDuplicateReq = await this.checkDuplicateFileRequested(
      parentReqData,
      configValue,
      body
    );

    if (isDuplicateReq?.message) {
      return isDuplicateReq;
    }

    const parentReq = new DownloadParentReq(parentReqData);
    const parentReqLog = await parentReq.save({ checkKeys: false });
    logger.info("parent req data saved for state produced ", {
      id: parentReqData._id,
      email: body.email,
      type: body.type,
    });
    const queueMsg = JSON.stringify({
      id: parentReqLog._id,
      type: `${body.type}Download`,
      name: body.name,
    });
    channel.sendToQueue(queue, Buffer.from(queueMsg), { persistent: true });
    return {
      message: "You will receive an email when the data is ready",
      parentReqId: parentReqData._id,
    };
  }

  public async checkDuplicateFileRequested(
    parentReqData: any,
    configValue: any,
    body: any
  ) {
    const searchQuery = { ...parentReqData };
    if (configValue?.isResponseUserIndependent) {
      delete searchQuery.userEmail;
      delete searchQuery.iamUuid;
      delete searchQuery.requestParams;
      searchQuery["requestParams.apiDetails"] = {
        $eq: parentReqData.requestParams.apiDetails,
      };
      searchQuery["requestParams.filterParams"] = {
        $eq: parentReqData.requestParams.filterParams,
      };
    }
    const timeDiff = moment().subtract(30, "minutes");
    const existingParentReq = await DownloadParentReq.find({
      updatedAt: { $gte: timeDiff },
      ...searchQuery,
    })
      .sort({
        updatedAt: -1,
      })
      .limit(1);

    if (existingParentReq.length) {
      if (
        existingParentReq[0].status === PARENT_API_STATUS.PRODUCED &&
        existingParentReq[0].userEmail === body.email
      ) {
        //TODO: can send email to other requester if the request is same by adding email in the parent
        return { message: "You have already requested the download data" };
      }

      if (existingParentReq[0].status === PARENT_API_STATUS.COMPLETED) {
        await this.sendDuplicateFileMail(
          existingParentReq[0],
          body,
          configValue
        );
        let message =
          "You have already received the data. Resending the processed file.";
        if (existingParentReq[0].userEmail !== body.email) {
          message =
            "File already genereated. Sending the processed file to the new email.";
        }
        return { message };
      }
    }

    return null;
  }

  public async sendDuplicateFileMail(
    existingParentReq: IDownloadParentReq,
    body: any,
    configValue: any
  ) {
    try {
      const signedUrls = [];
      for (const unsignedUrl of existingParentReq.awsLink) {
        const filePath = new URL(unsignedUrl).pathname.slice(1);
        const signedUrl = await this.uploadService.getSignedDownloadURL(
          decodeURIComponent(filePath)
        );
        signedUrls.push(signedUrl);
      }
      const customVariableFnParams: IMailVariables = {
        signedUrl: signedUrls.join("<br/><br/>"),
        query: body.apiParams,
        name: body.name,
        email: body.email,
      };
      await this.downloadHelper.sendEmail(customVariableFnParams, configValue);
    } catch (error) {
      logger.error(
        "error in sending mail when user requested file with same params",
        { error }
      );
    }
  }

  public pushToAccumulator(childQueueMsg: any, dataStoreType: string) {
    let accumulatorQueue = process.env.RABBIT_MQ_ACCUMULATOR_QUEUE;

    if (dataStoreType === DATA_STORAGE_TYPES.PDF) {
      accumulatorQueue = process.env.RABBIT_MQ_PDF_ACCUMULATOR_QUEUE;
    }

    const accumulatorQueueMsg = {
      parentReqId: childQueueMsg.parentReqId,
      type: childQueueMsg.type,
      name: childQueueMsg.name,
    };

    channel.sendToQueue(
      accumulatorQueue,
      Buffer.from(JSON.stringify(accumulatorQueueMsg)),
      {
        persistent: true,
      }
    );
  }

  public async markChildComplete(
    childReqId: string,
    parentReqId: string,
    childStatus: string
  ): Promise<IDownloadParentReq> {
    await DownloadChildReq.findByIdAndUpdate(childReqId, {
      status: childStatus,
    });
    const updateParams = {
      $inc: { childCompletedCount: 1 },
    };
    const parentReq = await DownloadParentReq.findByIdAndUpdate(
      parentReqId,
      updateParams,
      { new: true }
    ).lean();

    return parentReq;
  }
}

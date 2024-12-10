import { channel } from "@/config/rabbitMq";
import ComparatorParentReq from "@/models/mongo/comparator-parent-req.schema";
import CommonUtils from "@/utils/common-utils";
import { logger } from "@/utils/logger";
import { Message } from "amqplib";
import Container from "typedi";
import { Interface, createInterface } from "readline";
import { IComparatorChildReq } from "@/interfaces/comparator-child-req-schema.interface";
import ComparatorChildReq from "@/models/mongo/comparator-child-req.schema";
import { FilesComparatorService } from "../files-comparator.service";
import UploadService from "../upload-service";
import {
  CurrentFile,
  Transformation,
} from "@/interfaces/comparator-parent-consumer.interface";
import CommonApiHelper from "../helpers/common-api-helper";

const filesComparatorService = Container.get(FilesComparatorService);
const uploadService = Container.get(UploadService);
const apiHelper = Container.get(CommonApiHelper);

const filesComparatorParentConsumer = async (msg: Message): Promise<void> => {
  const queueMsg = JSON.parse(msg.content.toString());
  try {
    await CommonUtils.delay(1000);
    logger.info("Consuming file comparator consumer", { queueMsg });
    const parentReq = await ComparatorParentReq.findById(queueMsg.id).lean();

    const currentFile: CurrentFile = queueMsg.currentFile;
    const config = parentReq.configDetails;
    const fileLink = parentReq.inputFiles[currentFile];
    // const filePath = new URL(fileLink).pathname.slice(1);
    // const signedUrl = await uploadService.getSignedDownloadURL(
    //   decodeURIComponent(filePath)
    // );

    const options = {
      endpoint: fileLink,
      config: {
        responseType: "stream",
      },
    };
    const stream: any = await apiHelper.fetchData(options, {});

    const readInterface = createInterface({
      input: stream,
      terminal: false,
    });

    const skipRows: number = queueMsg.rowsRead;
    let columns: string[] = [];
    const comparisonColumns = config.comparisonColumn[queueMsg.currentFile];
    const columnsAllowed: string[] =
      currentFile === "file1"
        ? Object.keys(config.columnsAllowed)
        : Object.values(config.columnsAllowed);
    const transformations: Transformation[] =
      config.transformations[currentFile];

    let childComparatorArr: Partial<IComparatorChildReq>[] = [];

    const compareDataConfig = {
      parentReqId: queueMsg.id,
      lineNo: 0,
      currentFile,
      columns,
      skipRows,
      columnsAllowed,
      transformations,
      comparisonColumns,
      validations: config.validations[currentFile],
    };

    readInterface.on("line", (line) => {
      const columnData: string[] = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      if (compareDataConfig.lineNo === 0) {
        // Initial line, read the columns of CSV file
        columns = columnData.map((column) =>
          column.replace(/"/g, "").replace(/=/g, "")
        );
        compareDataConfig.columns = columns;
      } else {
        const childObj = filesComparatorService.prepareCompareData(
          compareDataConfig,
          columnData
        );
        if (childObj) {
          childComparatorArr.push(childObj);
        }
      }
      compareDataConfig.lineNo++;
      if (childComparatorArr.length === config.readMaxRowsAtOnce) {
        readInterface.pause();
      }
    });

    readInterface.on("pause", async () => {
      if (currentFile === "file2") {
        return readInterface.close();
      }

      // blindly insert for file1
      await ComparatorChildReq.insertMany(childComparatorArr);
      childComparatorArr = [];
      readInterface.resume();
    });

    await closeReadInterface(
      readInterface,
      currentFile,
      queueMsg,
      childComparatorArr,
      config
    );

    if (currentFile === "file1") {
      logger.info("file 1 comparison finished", { id: queueMsg.id });
      const newQueueMsg = JSON.stringify({
        ...queueMsg,
        currentFile: "file2",
        rowsRead: 0,
      });
      channel.sendToQueue(
        process.env.RABBIT_MQ_COMPARATOR_PARENT_QUEUE,
        Buffer.from(newQueueMsg),
        { persistent: true }
      );
    } else if (compareDataConfig.lineNo > queueMsg.rowsRead) {
      logger.info("file 2 chunk comparison finished", {
        id: queueMsg.id,
        rowsRead: compareDataConfig.lineNo,
      });
      const newQueueMsg = JSON.stringify({
        ...queueMsg,
        rowsRead: compareDataConfig.lineNo,
      });
      channel.sendToQueue(
        process.env.RABBIT_MQ_COMPARATOR_PARENT_QUEUE,
        Buffer.from(newQueueMsg),
        { persistent: true }
      );
    } else {
      logger.info("pushing to comparator accumulator queue", {
        id: queueMsg.id,
      });
      channel.sendToQueue(
        process.env.RABBIT_MQ_COMPARATOR_ACCUMULATOR_QUEUE,
        Buffer.from(JSON.stringify(queueMsg)),
        { persistent: true }
      );
    }

    channel.ack(msg);
  } catch (err) {
    const error = CommonUtils.isJsonString(err);
    logger.error("file comparator parent hit consumer error", { error });
    channel.nack(msg, false, false);
  }
};

const closeReadInterface = (
  readInterface: Interface,
  currentFile: CurrentFile,
  queueMsg: any,
  childComparatorArr: Partial<IComparatorChildReq>[],
  config: any
) => {
  return new Promise((resolve) => {
    readInterface.once("close", async () => {
      if (currentFile === "file1") {
        return resolve("");
      }
      // bulk update in chunks for file2
      logger.info("bulk row update initialized", { id: queueMsg.id });
      await CommonUtils.delay(100); // delay to get the leaked messages in read interface
      const childComparatorArrChunks = CommonUtils.splitArrayIntoChunks(
        childComparatorArr,
        config.batchUpdateSize
      );
      for (const [index, comparatorArr] of childComparatorArrChunks.entries()) {
        await filesComparatorService.checkBulkRowDiff(
          comparatorArr,
          index,
          queueMsg
        );
      }
      logger.info("bulk row update finished", { id: queueMsg.id });
      return resolve("");
    });
  });
};

export { filesComparatorParentConsumer };

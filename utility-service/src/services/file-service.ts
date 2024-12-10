import moment from "moment";
import path from "path";
import fs from "fs";
import Excel from "exceljs";
import { Inject, Service } from "typedi";
import { logger } from "@/utils/logger";
import { VEHICLE_TYPES } from "@/constants/vehicle.constants";
import _ from "lodash";
import CommonUtils from "@/utils/common-utils";
import MongoService from "./mongo-service";
import { v4 as uuidv4 } from "uuid";
import { HttpException } from "@/exceptions/HttpException";
import axios from "axios";
import { promisify } from "util";
import stream from "stream";
import { COMPARATOR_CHILD_STATUS } from "@/constants/files-comparator.constants";
import { IComparatorChildReq } from "@/interfaces/comparator-child-req-schema.interface";

@Service()
export class FileService {
  @Inject()
  private mongoService: MongoService;

  public async createFileAndHeadings(
    type: string,
    customName: string,
    csvHeadingsMapping: object,
    fileType: string
  ): Promise<any> {
    const date = moment().format("YYYY-MM-DD_HH-mm-ss");
    const uuid = uuidv4();
    const fileName = `${type}_${customName}_${uuid}_${date}.${fileType}`;
    const filePath = path.join(__dirname, `../uploads/${fileName}`);
    const fileTypeConfig = {
      csv: async () => {
        const headings = Object.values(csvHeadingsMapping)
          .map((heading) => `"${heading}"`)
          .join();
        await fs.promises.writeFile(filePath, headings + "\n", "utf8");
      },
      xlsx: async () => {
        const options = {
          filename: filePath,
          useStyles: true,
          useSharedStrings: true,
        };
        const workbook = new Excel.stream.xlsx.WorkbookWriter(options);
        const worksheet = workbook.addWorksheet("sheet1");
        const columns = [];
        for (const csvHeading in csvHeadingsMapping) {
          columns.push({
            key: csvHeading,
            header: csvHeadingsMapping[csvHeading],
          });
        }
        worksheet.columns = columns;
        worksheet.commit();
        await workbook.commit();
      },
    };
    await fileTypeConfig[fileType]?.();
    return { filePath, fileName };
  }

  public async accumulateDataAndWrite(
    documentsCount: number,
    queueMsg: any,
    configValue: any,
    filePath: string,
    lastIndexUpdatedAt: string
  ) {
    let rowsWritten = 0;
    const iterationCount = configValue.accumulationCount || 50;
    for (let i = 0; i < documentsCount; i += iterationCount) {
      const res = await this.mongoService.getDownloadChildData(
        queueMsg.parentReqId,
        lastIndexUpdatedAt,
        iterationCount
      );
      logger.info(
        `fetch response from mongo for ${queueMsg.parentReqId} ${i} ${lastIndexUpdatedAt}`
      );
      const childApiData: any = res.childApiData;
      lastIndexUpdatedAt = res.lastIndexUpdatedAt;
      const childApiDataToWrite: any = [];
      for (let child = 0; child < childApiData.length; child++) {
        const resDataLength = _.get(
          childApiData[child].apiResponse,
          configValue.apiResDataPath
        )?.length;
        if (resDataLength) {
          rowsWritten += resDataLength;
          childApiDataToWrite.push(childApiData[child]);
        }
      }
      await this.writeData(
        childApiDataToWrite,
        configValue,
        queueMsg,
        i,
        filePath
      );
    }
    return { lastIndexUpdatedAt, rowsWritten };
  }

  public async writeData(
    childApiData: any[],
    downloadApiDetails: any,
    queueMsg: any,
    iteration: number,
    filePath: string
  ): Promise<any> {
    const fileTypeWriteConfig = {
      csv: async () => {
        await this.writeDataToCsv(
          childApiData,
          downloadApiDetails,
          queueMsg,
          filePath,
          iteration
        );
      },
      xlsx: async () =>
        this.writeDataToXlsx(
          childApiData,
          downloadApiDetails,
          queueMsg,
          filePath,
          iteration
        ),
    };
    await fileTypeWriteConfig[downloadApiDetails?.dataStoreType]?.();
  }

  public async writeDataToCsv(
    childApiData: any[],
    downloadApiDetails: any,
    queueMsg: any,
    filePath: string,
    iteration: number
  ): Promise<any> {
    let finalData = "";
    logger.info(
      `inside write data to csv ${iteration} ${queueMsg.parentReqId}`
    );
    for (let j = 0; j < childApiData.length; j++) {
      const transformedDownloadData = await this.transformDownloadData(
        childApiData[j],
        downloadApiDetails,
        queueMsg.type
      );
      const dataStringified = CommonUtils.convertToCSV(
        transformedDownloadData,
        downloadApiDetails.csvHeadings
      );
      finalData += dataStringified + "\n";
    }
    logger.info(
      `loop completed for write data to csv ${iteration} ${queueMsg.parentReqId}`
    );
    await fs.promises.appendFile(filePath, finalData);
    logger.info("written to csv and i = ", {
      parentReqId: queueMsg.parentReqId,
      iteration,
    });
  }

  public async writeDataToXlsx(
    childApiData: any[],
    downloadApiDetails: any,
    queueMsg: any,
    filePath: any,
    iteration: number
  ): Promise<any> {
    const readStream = fs.createReadStream(filePath);
    const workbook = new Excel.Workbook();
    const streamWorkBook = await workbook.xlsx.read(readStream);
    if (
      childApiData.length === 1 &&
      !_.get(childApiData[0].apiResponse, downloadApiDetails.apiResDataPath)
        ?.length
    ) {
      return;
    }
    const worksheet = streamWorkBook.getWorksheet("sheet1");
    const objectKeys: string[] = Object.keys(downloadApiDetails.csvHeadings);
    let lastRow = worksheet.lastRow.number + 1;

    for (let i = 0; i < childApiData.length; i++) {
      for (const childApiResObj of _.get(
        childApiData[i].apiResponse,
        downloadApiDetails.apiResDataPath
      )) {
        const row = worksheet.getRow(lastRow);
        for (let k = 1; k <= objectKeys.length; k++)
          row.getCell(k).value = childApiResObj?.[objectKeys?.[k - 1]];
        lastRow++;
      }
    }
    logger.info("written to excel and i = ", {
      parentReqId: queueMsg.parentReqId,
      iteration,
    });
    await workbook.xlsx.writeFile(filePath);
    readStream.destroy();
  }

  public async transformDownloadData(
    apiReqLog: any,
    downloadApiDetails: any,
    type: string
  ): Promise<any> {
    const apiResponse = _.get(
      apiReqLog.apiResponse,
      downloadApiDetails.apiResDataPath
    );
    const downloadData = apiResponse?.map((data: any) => {
      const dataCsvKeys = {};

      for (const key in downloadApiDetails.csvHeadings) {
        dataCsvKeys[downloadApiDetails.csvHeadings[key]] = _.get(data, key);
      }
      const transformMapper = {
        casesDownload: () => this.transformCaseListingData(dataCsvKeys),
      };
      transformMapper[type]?.();
      return dataCsvKeys;
    });
    return downloadData;
  }

  public async getFileFromS3Link(
    s3Link: string,
    fileExtension: string
  ): Promise<string> {
    const filePath = path.join(
      __dirname,
      `../uploads/${uuidv4()}.${fileExtension}`
    );
    try {
      const finishedStreaming = promisify(stream.finished);
      const fileWriter = fs.createWriteStream(filePath);
      const response: any = await axios.get(s3Link, { responseType: "stream" });
      response.data.pipe(fileWriter);
      await finishedStreaming(fileWriter);
      return filePath;
    } catch (error) {
      logger.error("Error occured in getFileFromS3Link method", { error });
      if (fs.existsSync(filePath)) {
        fs.promises.unlink(filePath);
      }
      throw new HttpException(500, "error occured in getFileFromS3Link method");
    }
  }

  public transformCaseListingData(data: any) {
    data["Update Date"] = moment(data["Update Date"]).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    data["Create Date"] = moment(data["Create Date"]).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    data["Vehicle Type"] = VEHICLE_TYPES[data["Vehicle Type"]];
  }

  public createFileName(fileConfig: string[], data = {}): string {
    if (!fileConfig) {
      return "";
    }
    const fileNameObj = _.pick(data, fileConfig);
    return Object.values(fileNameObj).join("_").replace(/ /g, "_");
  }

  public async accumulateData(
    queueMsg: any,
    configValue: any,
    lastIndexUpdatedAt: string
  ) {
    const iterationCount = configValue.accumulationCount || 50;
    const res = await this.mongoService.getDownloadChildData(
      queueMsg.parentReqId,
      lastIndexUpdatedAt,
      iterationCount
    );
    logger.info(`fetch response from mongo for ${queueMsg.parentReqId}`);
    const childApiData: any = res.childApiData;
    let childApiDataToWrite: any = [];
    for (let child = 0; child < childApiData.length; child++) {
      const resData = _.get(
        childApiData[child].apiResponse,
        configValue.apiResDataPath
      );
      if (resData) {
        childApiDataToWrite = [...childApiDataToWrite, ...resData];
      }
    }

    return {
      data: {
        [configValue.accumulationDataKey]: childApiDataToWrite,
        miscellaneousData: _.get(
          childApiData[0]?.apiResponse,
          configValue.apiResMiscellaneousDataPath
        ),
      },
      template: configValue?.template?.PDF_TEMPLATE_NAME,
    };
  }

  public async prepareCsvComparatorReport(
    documentsCount: number,
    queueMsg: any,
    config: any,
    filePath: string,
    csvHeadings: any
  ) {
    let nextCursor = null;

    const iterationCount = config.accumulationCount || 10000;
    const csvHeadingsArr = Object.keys(csvHeadings);
    for (let i = 0; i < documentsCount; i += iterationCount) {
      const childApiDataToWrite: any[] = [];
      let finalData = "";
      const res = await this.mongoService.getFileComparatorChildData(
        queueMsg.id,
        nextCursor,
        iterationCount
      );
      logger.info(`file comparator response fetched from mongo for ${i}`, {
        id: queueMsg.id,
        nextCursor,
      });

      const chilData = res.childData;
      nextCursor = res.nextCursor;
      for (const errorRow of chilData) {
        const splitColumns = {};
        const comparisonRowArr = errorRow.comparatorValue?.split(",");
        for (const [index, comparisonRow] of comparisonRowArr?.entries()) {
          splitColumns[csvHeadingsArr[index]] = comparisonRow;
        }
        const errorObj = {
          ...splitColumns,
          Status: errorRow.status,
          "Error Details": this.getFileComparatorErrorMsg(
            errorRow,
            config.columnsAllowed
          ),
        };

        childApiDataToWrite.push(errorObj);
      }
      const dataStringified = CommonUtils.convertToCSV(
        childApiDataToWrite,
        csvHeadings
      );
      finalData += dataStringified + "\n";
      await fs.promises.appendFile(filePath, finalData);
      logger.info("comparator report written i = ", { i, id: queueMsg.id });
    }
  }

  public async removeFile(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      fs.promises.unlink(filePath);
    }
  }

  public getFileComparatorErrorMsg(
    errorRow: Partial<IComparatorChildReq>,
    columnsAllowed: any
  ): string {
    const errorDetailConfig = {
      [COMPARATOR_CHILD_STATUS.VALIDATION_FAILED]: (
        errorRow: Partial<IComparatorChildReq>
      ) => {
        return errorRow.validationErrors?.join();
      },
      [COMPARATOR_CHILD_STATUS.UNMATCHED]: (
        errorRow: Partial<IComparatorChildReq>
      ) => {
        const dataFileName = errorRow.rowData?.file1 ? "file1" : "file2";
        return `Data exists only in ${dataFileName}`;
      },
      [COMPARATOR_CHILD_STATUS.MISMATCHED]: (
        errorRow: Partial<IComparatorChildReq>
      ) => {
        const mismatchColumns = [];
        const rowData = errorRow.rowData;
        for (const columnAllowed of Object.entries(columnsAllowed)) {
          if (
            rowData.file1?.[columnAllowed[0]] !==
            rowData.file2?.[columnAllowed[1] as string]
          ) {
            mismatchColumns.push(columnAllowed[0]);
          }
        }
        return `Mismatched columns are ${mismatchColumns.join(", ")}`;
      },
    };
    return errorDetailConfig[errorRow.status]?.(errorRow) ?? "";
  }
}

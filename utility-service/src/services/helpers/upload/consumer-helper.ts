import { Inject, Service } from "typedi";
import _ from "lodash";
import { logger } from "@/utils/logger";
import DataModificationUtils from "@/utils/data-modification-utils";
import { v4 as uuidv4 } from "uuid";
import UploadChildReq from "@/models/mongo/upload-child-req.schema";
import { channel } from "@/config/rabbitMq";
import UploadFileFacade from "@/facades/upload-file.facade";
import { FileService } from "@/services/file-service";
import CommonUtils from "@/utils/common-utils";

import {
  DATA_STORE_TYPES,
  ERROR_MESSAGES,
  DEFAULT_SHEET_NAME_KEY,
  TYPE_VS_ROUTING_KEY,
  DEFAULT_DELAY,
} from "@/constants/upload.constants";
import CommunicationService from "@/services/communication-service";

@Service()
export default class ConsumerHelper {
  @Inject()
  private uploadFileFacade: UploadFileFacade;
  @Inject()
  private fileService: FileService;
  @Inject()
  private communicationService: CommunicationService;

  public generateConfigsByKey(
    config: any,
    sheetName: string,
    key: string,
    isPrimitive = false
  ) {
    try {
      const defaultReturnValue = isPrimitive ? null : {};
      const defaultConfig = _.get(
        config?.defaultConfig ?? {},
        key,
        defaultReturnValue
      );
      const keyBasedConfig = _.get(
        config?.keyBasedConfig?.[sheetName] ?? {},
        key,
        defaultReturnValue
      );
      if (isPrimitive) {
        return keyBasedConfig ?? defaultConfig;
      }

      return { ...defaultConfig, ...keyBasedConfig };
    } catch (error) {}
  }

  public preProcessConfigs(config: any, sheetNames: string[] = []): any {
    const preProccessedConfig: any = {};
    sheetNames.forEach((sheetName) => {
      preProccessedConfig[sheetName] = {};
      preProccessedConfig[sheetName]["valuesModification"] =
        this.generateConfigsByKey(
          config,
          sheetName,
          "input.valuesModification"
        );

      preProccessedConfig[sheetName]["keysModification"] =
        this.generateConfigsByKey(config, sheetName, "input.keysModification");

      preProccessedConfig[sheetName]["fileRowInputKey"] =
        this.generateConfigsByKey(config, sheetName, "input.fileRowInputKey");

      preProccessedConfig[sheetName]["groupByKey"] = this.generateConfigsByKey(
        config,
        sheetName,
        "input.groupByKey",
        true
      );

      preProccessedConfig[sheetName]["batchSize"] = this.generateConfigsByKey(
        config,
        sheetName,
        "input.batchSize",
        true
      );

      preProccessedConfig[sheetName]["additionalRequestParams"] =
        this.generateConfigsByKey(
          config,
          sheetName,
          "input.additionalRequestParams"
        );

      preProccessedConfig[sheetName]["delay"] = this.generateConfigsByKey(
        config,
        sheetName,
        "input.delay",
        true
      );
    });

    return preProccessedConfig;
  }

  public async dataModificationLayer(
    data: any,
    config: any,
    preProcessedConfig
  ) {
    for (const sheetName in data) {
      //filter keys out
      const allowedSheets = config?.allowedSheets;
      if (allowedSheets?.length && !allowedSheets.includes(sheetName)) {
        logger.info(
          `Unknown sheet: ${sheetName} found in excel for config for ${config.apiEndpoint}`
        );
        if (data[sheetName]) {
          delete data[sheetName];
        }
        continue;
      }
      //modify data
      data[sheetName] = await this.transformData(
        data[sheetName],
        preProcessedConfig[sheetName].valuesModification,
        preProcessedConfig[sheetName].keysModification
      );
    }
    return data;
  }

  private async transformData(
    rows: any[],
    valuesModificationConfig: any,
    keyModificationConfig: any
  ) {
    try {
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        this.transformValues(rows[rowIndex], valuesModificationConfig);
        this.transformKeys(rows[rowIndex], keyModificationConfig);
      }

      return rows;
    } catch (error) {
      logger.error("Error while transforming values", { error });
    }
  }

  public transformValues(row: any[], valuesModificationConfig: any) {
    try {
      for (const key in valuesModificationConfig) {
        if (row[key]) {
          const transformedData = this.transformSingleEntity(
            row[key],
            valuesModificationConfig[key]
          );
          row[key] = transformedData;
        }
      }
    } catch (error) {
      logger.error("error occured in transformValues method", {
        error,
      });
    }
  }

  private transformKeys(row: any[], keyModificationConfig: any) {
    try {
      for (const key in keyModificationConfig) {
        if (row.hasOwnProperty(key)) {
          row[keyModificationConfig[key]] = row[key];
          delete row[key];
        }
      }
    } catch (error) {
      logger.error("error occured in transformKeys method", {
        error,
      });
    }
  }

  private transformSingleEntity(value: string, methodName: string) {
    try {
      const methodMap = {
        dateToHyphenSeparatedDescDateString:
          DataModificationUtils.dateToHyphenSeparatedDescDateString,
        jsonToString: DataModificationUtils.jsonToString,
        trimString: DataModificationUtils.trimString,
      };
      if (!methodMap[methodName]) {
        logger.error("Unknown method found, returning the value present");
        return value;
      }
      return methodMap[methodName](value);
    } catch (error) {
      logger.error("Error while transforming entity", { error });
    }
  }

  public groupRows(data: any, preProccesedConfig: any) {
    for (const sheetName in data) {
      const rows = data[sheetName];
      const batchSize = preProccesedConfig[sheetName]?.batchSize;
      const groupByParam = preProccesedConfig[sheetName]?.groupByKey;

      //either records can be bulked into batches or can be grouped by identifier
      if (batchSize) {
        data[sheetName] = this.groupDataByBatches(rows, batchSize);
        continue;
      }

      const groupedData = this.groupDataByIdentifier(rows, groupByParam);
      data[sheetName] = groupedData;
    }
  }

  private groupDataByIdentifier(rows: any[], groupByParam: string) {
    try {
      const groupedData = {};
      const numberOfRows = rows.length;
      for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
        if (groupedData[rows?.[rowIndex]?.[groupByParam]]?.length) {
          groupedData[rows?.[rowIndex]?.[groupByParam]].push(rows?.[rowIndex]);
          continue;
        }

        groupedData[rows?.[rowIndex]?.[groupByParam] ?? uuidv4()] = [
          rows[rowIndex],
        ];
      }
      return Object.values(groupedData);
    } catch (error) {
      logger.error(
        "error while grouping rows in method groupDataByIdentifier",
        { error }
      );
    }
  }

  private groupDataByBatches(rows: any[], batchSize: number) {
    try {
      const safeBatchSize = batchSize < 1 ? 1 : batchSize;
      const groupedData = [];
      const numberOfRows = rows.length;
      for (
        let rowIndex = 0;
        rowIndex < numberOfRows;
        rowIndex += safeBatchSize
      ) {
        groupedData.push(rows.slice(rowIndex, rowIndex + safeBatchSize));
      }
      return groupedData;
    } catch (error) {
      logger.error("Error while grouping data", { errorMsg: error });
      return [];
    }
  }

  public async createChildMessage(
    row: any,
    apiParams: any,
    preProccesedConfig: any,
    sheetName: string,
    parentRequestId: string,
    type: string,
    config: any,
    headers: any,
    index: number
  ) {
    try {
      const additionalRequestParams =
        preProccesedConfig[sheetName].additionalRequestParams;
      const fileRowInputKey = preProccesedConfig[sheetName].fileRowInputKey;

      const delay =
        (preProccesedConfig[sheetName].delay ?? DEFAULT_DELAY) * index;

      let body = {
        ...(apiParams ?? {}),
        ...additionalRequestParams,
      };
      body = this.addRowInRequestBody(row, body, fileRowInputKey);

      const childReqLogData = new UploadChildReq({
        hitCount: 0,
        parentRequestId,
        requestParams: body,
        config,
        type,
        sheetName,
      });
      const childReqLog = await childReqLogData.save({ checkKeys: false });
      const routingKey =
        TYPE_VS_ROUTING_KEY[config?.queueType] ??
        process.env.RABBIT_MQ_UPLOAD_CHILD_QUEUE_ROUTING_KEY;
      const exchange = process.env.RABBIT_MQ_UPLOAD_ORCHESTRATOR_EXCHANGE;
      const childMongoId = childReqLog._id;
      logger.info(
        `Generated a child message of type: ${type} with id of ${childMongoId}`
      );
      const childQueueMessage = JSON.stringify({
        hitCount: 0,
        parentRequestId,
        requestParams: body,
        config,
        type,
        headers,
        id: childMongoId,
      });
      logger.info(`Pushing upload child message in queue ${childMongoId}`);
      channel.publish(exchange, routingKey, Buffer.from(childQueueMessage), {
        headers: {
          "x-delay": delay,
        },
        persistent: true,
      });
    } catch (error) {
      logger.error("error while creating child messages", { error });
    }
  }

  private addRowInRequestBody(row: any[], body: any, rowEntryKey: any) {
    if (!Object.keys(rowEntryKey)?.length) {
      row.forEach((entry) => {
        if (_.isObject(entry) && !_.isArray(entry)) {
          for (const entryKey in entry) {
            body[entryKey] = entry[entryKey];
          }
        }
      });
      return body;
    }

    if (rowEntryKey?.type === "Array" && rowEntryKey?.value) {
      body[rowEntryKey?.value] = row;
      return body;
    }

    if (rowEntryKey?.value && row?.length) {
      body[rowEntryKey?.value] = { ...row?.[0] };
      return body;
    }

    return body;
  }

  public async createAccumulatorMessage(queueMsg: any) {
    try {
      const accumulatorMessage = JSON.stringify({ ...queueMsg, hitCount: 0 });
      channel.publish(
        process.env.RABBIT_MQ_UPLOAD_ACCUMULATOR_EXCHANGE,
        process.env.RABBIT_MQ_UPLOAD_ACCUMULATOR_ROUTING_KEY,
        Buffer.from(accumulatorMessage),
        { headers: { "x-delay": 10000 }, persistent: true }
      );
    } catch (error) {
      logger.error("Error occured in createAccumulatorMessage", { error });
    }
  }

  public async getDataFromMessage(message: any) {
    try {
      const config = message.apiConfig;
      const dataStoreType = config.dataStoreType;
      const data = message?.data;
      if (dataStoreType === DATA_STORE_TYPES.DATA) {
        if (_.isArray(data)) {
          return {
            [DEFAULT_SHEET_NAME_KEY]: data,
          };
        }
        if (_.isObject(data)) {
          return data;
        }
        throw ERROR_MESSAGES.ARRAY_OR_OBJECT_TYPE_REQUIRED;
      }
      const file = await this.fileService.getFileFromS3Link(
        message.requestFileLink?.signedUrl,
        dataStoreType
      );
      const uploadFileData = await this.uploadFileFacade.fileToData(
        file,
        dataStoreType
      );
      await CommonUtils.unSyncFile(file);
      return uploadFileData;
    } catch (error) {
      logger.error("Error while getting data from message", {
        errorMsg: error,
      });
    }
  }
}

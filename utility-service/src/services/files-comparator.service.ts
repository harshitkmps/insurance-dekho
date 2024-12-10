import { channel } from "@/config/rabbitMq";
import { COMPARATOR_CHILD_STATUS } from "@/constants/files-comparator.constants";
import { AddCompareFilesBody } from "@/dtos/compare-files.dto";
import { IComparatorChildReq } from "@/interfaces/comparator-child-req-schema.interface";
import {
  CurrentFile,
  Transformation,
} from "@/interfaces/comparator-parent-consumer.interface";
import { IComparatorParentReq } from "@/interfaces/comparator-parent-req-schema.interface";
import ComparatorChildReq from "@/models/mongo/comparator-child-req.schema";
import ComparatorParentReq from "@/models/mongo/comparator-parent-req.schema";
import CommonUtils from "@/utils/common-utils";
import { logger } from "@/utils/logger";
import _ from "lodash";
import { Inject, Service } from "typedi";
import { RowValidationService } from "./row-validation.service";
import { FilesComparatorDecorator } from "@/decorators/files-comparator.decorator";

@Service()
export class FilesComparatorService {
  @Inject()
  private filesComparatorDecorator: FilesComparatorDecorator;
  @Inject()
  private rowValidationService: RowValidationService;

  public async produceParentHit(
    body: AddCompareFilesBody,
    config: any
  ): Promise<any> {
    const queue = process.env.RABBIT_MQ_COMPARATOR_PARENT_QUEUE;
    logger.debug("Writing to comparator parent queue", {
      queueName: queue,
    });

    const parentReqData: Partial<IComparatorParentReq> = {
      inputFiles: {
        file1: body.fileLink1,
        file2: body.fileLink2,
      },
      iamUuid: body.uuid,
      email: body.email,
      type: body.type,
      requestSource: body.requestSource,
      configDetails: config.configValue,
    };

    const parentReq = new ComparatorParentReq(parentReqData);
    const comparatorParentReq = await parentReq.save({ checkKeys: false });
    logger.info("comparator parent req produced", {
      id: parentReqData._id,
      email: body.email,
      type: body.type,
    });
    const queueMsg = JSON.stringify({
      id: comparatorParentReq._id,
      type: body.type,
      name: body.name,
      currentFile: "file1",
      rowsRead: 0,
    });
    channel.sendToQueue(queue, Buffer.from(queueMsg), { persistent: true });

    return {
      message: "You will receive an email when the comparison is finished",
    };
  }

  public async checkBulkRowDiff(
    comparatorArr: Partial<IComparatorChildReq>[],
    index: number,
    queueMsg: any
  ): Promise<void> {
    const promises = [];
    for (const comparatorChild of comparatorArr) {
      promises.push(this.checkRowDiffAndUpdate(comparatorChild));
    }
    logger.info("diff check start in DB", { index, id: queueMsg.id });
    await Promise.all(promises);
  }

  public async checkRowDiffAndUpdate(
    comparatorChild: Partial<IComparatorChildReq>
  ) {
    const existingRowChild = await ComparatorChildReq.findOne({
      parentReqId: comparatorChild.parentReqId,
      comparatorValue: comparatorChild.comparatorValue,
    });

    if (!existingRowChild) {
      const comparatorChildData = new ComparatorChildReq(comparatorChild);
      return comparatorChildData.save();
    }

    if (existingRowChild.rowData?.file2) {
      // Already diff checked for this row
      return null;
    }

    existingRowChild.rowData.file2 = comparatorChild.rowData.file2;

    if (existingRowChild.status === COMPARATOR_CHILD_STATUS.VALIDATION_FAILED) {
      return existingRowChild.save();
    }

    if (existingRowChild.columnHash === comparatorChild.columnHash) {
      existingRowChild.status = COMPARATOR_CHILD_STATUS.MATCHED;
      return existingRowChild.save();
    }

    existingRowChild.status = COMPARATOR_CHILD_STATUS.MISMATCHED;
    return existingRowChild.save();
  }

  public prepareChildCompareObj(
    parentReqId: string,
    columns: string[],
    columnData: string[],
    columnsAllowed: string[],
    transformations: Transformation[],
    comparisonColumns: string[],
    validations = [],
    currentFile: CurrentFile
  ): Partial<IComparatorChildReq> {
    const rowData = this.createRow(columns, columnData); // First create row object from column data
    this.transformRow(rowData, transformations); // Transform row as per transformation config
    const failedValidations: string[] = this.rowValidationService.validateRow(
      rowData,
      validations
    );
    const comparisonRowData = Object.values(
      _.pick(rowData, comparisonColumns)
    ).join(","); // Pick row values for comparison columns
    if (!comparisonRowData?.length) {
      // If no comparison rows are found
      return null;
    }

    const requiredColumns = _.pick(rowData, columnsAllowed); // Pick required columns
    const comparatorChildReq: Partial<IComparatorChildReq> = {
      parentReqId,
      comparatorValue: comparisonRowData,
      rowData: {
        [currentFile]: requiredColumns,
      },
      columnHash: CommonUtils.sha256(
        Object.values(requiredColumns).sort().join(",")
      ),
      status: failedValidations?.length
        ? COMPARATOR_CHILD_STATUS.VALIDATION_FAILED
        : COMPARATOR_CHILD_STATUS.UNMATCHED,
      validationErrors: failedValidations,
    };

    return comparatorChildReq;
  }

  public createRow(columns: string[], data: string[]): any {
    const rowData = {};
    for (const [index, column] of data.entries()) {
      rowData[columns[index]] = column
        .replace(/"/g, "")
        .replace(/=/g, "")
        .toLowerCase();
    }
    return rowData;
  }

  public transformRow(
    requiredColumns: any,
    transformations: Transformation[]
  ): any {
    for (const transformation of transformations) {
      const column = transformation.columnName;
      if (transformation?.mapping) {
        requiredColumns[column] =
          transformation.mapping[requiredColumns[column]] ??
          requiredColumns[column];
      } else if (transformation?.applyFunction) {
        requiredColumns[column] = this.filesComparatorDecorator[
          transformation.applyFunction
        ]?.(requiredColumns[column]);
      }
    }
  }

  public prepareCompareData(
    config: any,
    columnData: string[]
  ): Partial<IComparatorChildReq> {
    const {
      parentReqId,
      currentFile,
      skipRows,
      columns,
      columnsAllowed,
      transformations,
      comparisonColumns,
      validations,
    } = config;

    if (currentFile === "file1") {
      /*
        Since it is first file, prepare data for insertion
        File 1 is read and inserted in DB all at once
      */
      const childObj = this.prepareChildCompareObj(
        parentReqId,
        columns,
        columnData,
        columnsAllowed,
        transformations,
        comparisonColumns,
        validations,
        currentFile
      );
      return childObj;
    } else if (config.lineNo >= skipRows) {
      /* 
        This is for file 2. File 2 is read in chunks. 
        Only start reading new lines if we are past already read lines
      */
      const childObj = this.prepareChildCompareObj(
        parentReqId,
        columns,
        columnData,
        columnsAllowed,
        transformations,
        comparisonColumns,
        validations,
        currentFile
      );
      return childObj;
    }
    // Do thing, just read the next line
    return null;
  }
}

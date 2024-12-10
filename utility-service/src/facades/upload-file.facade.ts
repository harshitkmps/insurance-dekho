import { UploadedFileDto } from "../dtos/file";
import { logger } from "@/utils/logger";
import { Inject, Service } from "typedi";
import UploadService from "@/services/upload-service";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import Excel from "exceljs";
import xlsx from "xlsx";
import { FileService } from "@/services/file-service";
import CommonUtils from "@utils/common-utils";
import stream from "stream";
import { parse } from "csv-parse";
import { stringify } from "csv-stringify";
import { promisify } from "util";
import {
  DEFAULT_SHEET_NAME_KEY,
  MAX_EXECL_COLUMN_LENGTH,
  MAX_EXECL_ROW_LENGTH,
} from "@/constants/upload.constants";

@Service()
export default class UploadFileFacade {
  @Inject()
  private uploadService: UploadService;
  @Inject()
  private fileService: FileService;

  public async uploadFile(uploadedFile: UploadedFileDto): Promise<string> {
    let s3Link = "";
    if (uploadedFile.type === "File") {
      s3Link = await this.uploadFileToS3(uploadedFile);
    }
    if (uploadedFile.type === "Link") {
      s3Link = await this.uploadFileLinkToS3(uploadedFile);
    }

    logger.info(`Created s3 link for the file ${s3Link}`);
    return s3Link;
  }

  public async uploadFileToS3(uploadedFile: UploadedFileDto) {
    try {
      const filePath = path.join(
        __dirname,
        `../uploads/${uuidv4() + "." + uploadedFile.extension}`
      );
      const s3Link = await this.uploadService.uploadFileToS3(
        filePath,
        uploadedFile.file.buffer
      );
      return s3Link;
    } catch (error) {
      logger.error("error in uploadFileToS3 method in upload file facade", {
        error,
      });
    }
  }

  public async uploadFileLinkToS3(uploadedFile: UploadedFileDto) {
    try {
      const filePath: string = await this.fileService.getFileFromS3Link(
        uploadedFile.file,
        uploadedFile.extension
      );
      const s3Link = await this.uploadService.uploadFileToS3(filePath);
      if (fs.existsSync(filePath)) {
        fs.promises.unlink(filePath);
      }
      return s3Link;
    } catch (error) {
      logger.error("error in uploadFileLinkToS3 method in upload file facade", {
        error,
      });
    }
  }

  public async fileToData(filePath: string, fileExtension: string) {
    let data = null;
    if (fileExtension === "xlsx") {
      data = await this.convertExcelFileToData(filePath);
    }
    if (fileExtension === "csv") {
      data = await this.convertCsvFileToData(filePath);
    }
    return data;
  }

  public async convertCsvFileToData(filePath: string) {
    try {
      const data = {};
      const parser = parse({
        delimiter: ",",
        columns: true,
        trim: true,
      });

      const records = [];

      parser.on("readable", function () {
        let record;
        while ((record = parser.read()) !== null) {
          records.push(record);
        }
      });

      parser.on("error", function (error) {
        logger.error("Error while parsing csv file", { error });
      });

      parser.on("end", function () {
        logger.info("CSV read successfully");
      });
      const finishedStreaming = promisify(stream.finished);
      const csvWriter = fs.createReadStream(filePath);
      csvWriter.pipe(parser);
      await finishedStreaming(csvWriter);

      data[DEFAULT_SHEET_NAME_KEY] = records;

      return data;
    } catch (error) {
      logger.error("Error while reading CSV file", error);
    }
  }

  private updateSheetRange(worksheet: xlsx.WorkSheet) {
    const range: xlsx.Range = {
      s: { r: MAX_EXECL_ROW_LENGTH, c: MAX_EXECL_COLUMN_LENGTH },
      e: { r: 0, c: 0 },
    };
    Object.keys(worksheet)
      .filter(function (row) {
        return row.charAt(0) != "!";
      })
      .map(xlsx.utils.decode_cell)
      .forEach(function (cellAddress) {
        range.s.c = Math.min(range.s.c, cellAddress.c);
        range.s.r = Math.min(range.s.r, cellAddress.r);
        range.e.c = Math.max(range.e.c, cellAddress.c);
        range.e.r = Math.max(range.e.r, cellAddress.r);
      });
    worksheet["!ref"] = xlsx.utils.encode_range(range);
  }

  public async convertExcelFileToData(filePath: string) {
    try {
      const data = {};
      const excelFile: xlsx.WorkBook | null = xlsx.readFile(filePath, {
        cellDates: true,
        dateNF: "DD-MM-YYYY",
      });
      excelFile.SheetNames.forEach((sheetName) => {
        this.updateSheetRange(excelFile.Sheets[sheetName]);
        data[sheetName.trim()] = xlsx.utils.sheet_to_json(
          excelFile.Sheets[sheetName],
          {
            defval: "",
          }
        );
      });
      return data;
    } catch (error) {
      logger.error("Error while reading excel file", { error });
    }
  }

  public async dataToFile(data: any, type: string, config: any) {
    const filePath = path.join(
      __dirname,
      `../uploads/${uuidv4() + "." + type}`
    );
    if (type === "xlsx") {
      await this.convertDataToExcel(data, filePath, config);
    }
    if (type === "csv") {
      await this.convertDataToCsv(data, filePath, config);
    }
    return filePath;
  }

  public async convertDataToCsv(data: any, filePath: string, config: any) {
    try {
      const sheetName = Object.keys(data)[0];
      const finishedStreaming = promisify(stream.finished);
      const flatData = data[sheetName].flatMap((rows: any) => rows);

      const csvMapping = {
        ...(config?.defaultConfig.output?.csvMapping ?? {}),
        ...(config?.keyBasedConfig?.[sheetName]?.output?.csvMapping ?? {}),
      };

      if (!Object.keys(csvMapping)?.length) {
        const firstEntry = data?.[sheetName]?.[0]?.[0] ?? {};
        Object.keys(firstEntry)?.forEach((key) => (csvMapping[key] = key));
      }

      const csvHeadings = Object.values(csvMapping);
      const csvData = [csvHeadings];

      flatData.forEach((obj: any) => {
        csvData.push(Object.keys(csvMapping).map((key) => obj?.[key]));
      });

      const csvReader = fs.createWriteStream(filePath);
      const csvStringifier = stringify({ header: false });
      csvStringifier.pipe(csvReader);
      csvData.forEach((row: any) => {
        if (!!row) csvStringifier.write(row);
      });
      csvStringifier.end();
      await finishedStreaming(csvReader);
      logger.info("The CSV file was written successfully.", { filePath });

      return filePath;
    } catch (error) {
      logger.error("error while creating csv for upload", error);
    }
  }

  public async convertDataToExcel(data: any, filePath: string, config: any) {
    try {
      const options = {
        filename: filePath,
        useStyles: true,
        useSharedStrings: true,
      };
      const workbook = new Excel.stream.xlsx.WorkbookWriter(options);
      const sheetNames = Object.keys(data);
      for (let sheetIndex = 0; sheetIndex < sheetNames.length; ++sheetIndex) {
        const sheetName = sheetNames[sheetIndex];
        const documents = data[sheetName];
        const worksheet = workbook.addWorksheet(sheetName);
        const numberOfDocuments = documents.length;
        if (!numberOfDocuments) {
          continue;
        }
        //create csv heading
        const firstDocument = documents?.[0];
        const csvHeadings = CommonUtils.isObject(firstDocument)
          ? Object.keys(firstDocument)
          : Object.keys(firstDocument?.[0]);
        const csvMapping = {
          ...(config?.defaultConfig?.output?.csvMapping ?? {}),
          ...(config?.keyBasedConfig?.[sheetName]?.output?.csvMapping ?? {}),
        };
        const columns = [];
        for (
          let csvHeadingIterator = 0;
          csvHeadingIterator < csvHeadings.length;
          ++csvHeadingIterator
        ) {
          const headingKey = csvHeadings[csvHeadingIterator];
          columns.push({
            key: headingKey,
            header: csvMapping[headingKey] ?? headingKey,
          });
        }
        worksheet.columns = columns;
        //insert rows in the sheet
        for (
          let documentIndex = 0;
          documentIndex < numberOfDocuments;
          documentIndex++
        ) {
          if (documents[documentIndex]?.length) {
            for (
              let subDocumentIndex = 0;
              subDocumentIndex < documents[documentIndex]?.length;
              subDocumentIndex++
            ) {
              worksheet.addRow(documents[documentIndex][subDocumentIndex]);
            }
          } else {
            worksheet.addRow(documents[documentIndex]);
          }
        }
        worksheet.commit();
      }
      await workbook.commit();

      return filePath;
    } catch (error) {
      logger.error("Error while creating excel file ", { error });
    }
  }
}

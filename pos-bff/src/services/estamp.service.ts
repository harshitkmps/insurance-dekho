import { Injectable } from "@nestjs/common";
import { SaveEStampDto } from "../dtos/estamp/save-estamp.dto";
import ApiPosService from "./apipos-service";
import { SaveEStampBody } from "../interfaces/api-pos/upload-estamp.interface";
import FormData from "form-data";
import { GetEStampsDto } from "../dtos/estamp/get-estamp.dto";
import { GetEStampsQuery } from "../interfaces/api-pos/get-estamps.interface";
import moment from "moment";
import { ESTAMP_LIST_TABLE_HEADERS } from "../constants/estamp.constants";

@Injectable()
export class EStampService {
  constructor(private apiPosService: ApiPosService) {}

  public async uploadEStamp(file: Express.Multer.File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file.buffer, file.originalname);
    formData.append("type", "estamp");

    const response = await this.apiPosService.uploadFile(formData);
    return response.key;
  }

  public async saveEStamp(body: SaveEStampDto, uuid: string): Promise<any> {
    const saveEStampBody: SaveEStampBody = {
      file: body.file,
      iamUuid: uuid,
    };
    const result = await this.apiPosService.saveEStamp(saveEStampBody);

    return result;
  }

  public async getEStamp(query: GetEStampsDto): Promise<any> {
    const getEStampQuery: GetEStampsQuery = {};
    if (query.nextCursor) {
      getEStampQuery.nextCursor = query.nextCursor;
    }

    const response = await this.apiPosService.getEStamps(getEStampQuery);

    const transformedEStamps = response.estamps.map((estamp: any) => ({
      certificateDate: moment(estamp.certificate_date).format("YYYY-MM-DD"),
      certificateNumber: estamp.certificate_number,
      assignmentDate: moment(estamp.assignment_date).format("YYYY-MM-DD"),
      createdAt: estamp.added,
    }));
    return {
      estamps: transformedEStamps,
      pagination: response.pagination,
      tableHeaders: ESTAMP_LIST_TABLE_HEADERS,
    };
  }
}

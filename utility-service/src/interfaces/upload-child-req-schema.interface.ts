export interface IUploadChildReqSchema {
  _id: string;
  hitCount: number;
  parentRequestId: string;
  status: string;
  requestParams: any;
  apiResponse: any;
  sheetName?: string;
  config: any;
  type: string;
  responseFileLink: string;
  createdAt: Date;
  updatedAt: Date;
}

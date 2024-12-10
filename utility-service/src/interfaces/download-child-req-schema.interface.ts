export interface IDownloadChildReq {
  _id: string;
  requestParams: any;
  hitCount: number;
  parentReqId: string;
  status: string;
  apiResponse: any;
  sequenceNo: number;
  parallelChildSequenceNo: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGstDetailsParentReqSchema {
  _id: string;
  iamUuid: string;
  pan: string;
  gcdCode: string;
  hitCount: number;
  status: string;
  gstResponseReqId: string;
  createdAt: Date;
  updatedAt: Date;
  response: object;
}

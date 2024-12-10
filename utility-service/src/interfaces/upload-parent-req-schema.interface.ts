export interface IUploadParentReqSchema {
  _id: string;
  status: string;
  userEmail: string;
  iamUuid: number;
  requestParams: any;
  apiConfig: any;
  source: string;
  requestFileLink: string;
  responseFileLink: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDownloadParentReq {
  _id: string;
  status: string;
  type: string;
  userEmail: string;
  iamUuid: number;
  api: string;
  requestSource: string;
  awsLink: string[];
  childCompletedCount: number;
  requestParams: any;
  createdAt: Date;
  updatedAt: Date;
}

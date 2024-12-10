export interface IComparatorParentReq {
  _id: string;
  inputFiles: IComparatorInputFiles;
  responseFile: string;
  hitCount: number;
  status: string;
  iamUuid: string;
  email: string;
  type: string;
  requestSource: string;
  configDetails: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComparatorInputFiles {
  file1: string;
  file2: string;
}

export interface IComparatorChildReq {
  _id: string;
  parentReqId: string;
  comparatorValue: string;
  status: string;
  rowData: IComparatorRowData;
  columnHash: string;
  validationErrors: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IComparatorRowData {
  file1?: any;
  file2?: any;
}

import { IComparatorChildReq } from "./comparator-child-req-schema.interface";

export interface FileComparatorChildDataRes {
  childData: Partial<IComparatorChildReq>[];
  nextCursor: null | string;
}

export interface ComparatorStats {
  MATCHED: number;
  MISMATCHED: number;
  UNMATCHED: number;
  VALIDATION_FAILED: number;
}

export interface ComparatorMailVariables extends ComparatorStats {
  email: string;
  link: string;
  name: string;
}

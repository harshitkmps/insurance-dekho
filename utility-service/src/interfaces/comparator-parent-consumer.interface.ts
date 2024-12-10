export type CurrentFile = "file1" | "file2";

export interface Transformation {
  columnName: string;
  mapping?: TransformMapping;
  applyFunction?: string;
}

export interface TransformMapping {
  [key: string]: string;
}

export type ComparatorTransform = {
  [file in CurrentFile]: TransformMapping;
};

import { model, Schema, Document, SchemaTypes } from "mongoose";
import { IComparatorChildReq } from "@/interfaces/comparator-child-req-schema.interface";
import { COMPARATOR_CHILD_STATUS } from "@/constants/files-comparator.constants";

const comparatorChildReq: Schema = new Schema(
  {
    parentReqId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(COMPARATOR_CHILD_STATUS),
      default: COMPARATOR_CHILD_STATUS.UNMATCHED,
    },
    comparatorValue: {
      type: String,
      required: true,
    },
    validationErrors: [
      {
        type: String,
        required: false,
      },
    ],
    rowData: {
      file1: {
        type: SchemaTypes.Mixed,
        required: false,
      },
      file2: {
        type: SchemaTypes.Mixed,
        required: false,
      },
    },
    columnHash: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const ComparatorChildReq = model<IComparatorChildReq & Document>(
  "comparator_child_req",
  comparatorChildReq
);

export default ComparatorChildReq;

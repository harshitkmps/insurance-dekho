import { model, Schema, Document, SchemaTypes } from "mongoose";
import { IComparatorParentReq } from "@/interfaces/comparator-parent-req-schema.interface";
import { COMPARATOR_PARENT_STATUS } from "@/constants/files-comparator.constants";

const comparatorParentReq: Schema = new Schema(
  {
    inputFiles: {
      file1: {
        type: String,
        required: true,
      },
      file2: {
        type: String,
        required: true,
      },
    },
    responseFile: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: Object.values(COMPARATOR_PARENT_STATUS),
      default: COMPARATOR_PARENT_STATUS.PRODUCED,
    },
    iamUuid: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    requestSource: {
      type: String,
      required: true,
    },
    configDetails: {
      type: SchemaTypes.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ComparatorParentReq = model<IComparatorParentReq & Document>(
  "comparator_parent_req",
  comparatorParentReq
);

export default ComparatorParentReq;

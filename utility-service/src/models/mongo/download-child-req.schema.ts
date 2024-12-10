import { model, Schema, Document } from "mongoose";
import { CHILD_API_STATUS } from "@/constants/download.constants";
import { IDownloadChildReq } from "@/interfaces/download-child-req-schema.interface";

const downloadChildReq: Schema = new Schema(
  {
    requestParams: {
      type: Object,
      required: false,
    },
    hitCount: {
      type: Number,
      required: true,
      default: 0,
    },
    parentReqId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(CHILD_API_STATUS),
      default: CHILD_API_STATUS.PRODUCED,
    },
    sequenceNo: {
      type: Number,
      required: true,
    },
    parallelChildSequenceNo: {
      type: Number,
      required: true,
    },
    apiResponse: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

const DownloadChildReq = model<IDownloadChildReq & Document>(
  "download_child_req",
  downloadChildReq
);

export default DownloadChildReq;

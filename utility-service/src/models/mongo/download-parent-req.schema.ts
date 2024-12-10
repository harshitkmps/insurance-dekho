import { model, Schema, Document } from "mongoose";
import { IDownloadParentReq } from "@interfaces/download-parent-req-schema.interface";
import { PARENT_API_STATUS } from "@/constants/download.constants";

const downloadParentReqSchema: Schema = new Schema(
  {
    status: {
      type: String,
      enum: Object.values(PARENT_API_STATUS),
      default: PARENT_API_STATUS.PRODUCED,
    },
    awsLink: [String],
    type: {
      type: String,
      required: true,
    },
    childCompletedCount: {
      type: Number,
      default: 0,
    },
    userEmail: {
      type: String,
      required: true,
    },
    iamUuid: {
      type: String,
      required: true,
    },
    requestSource: {
      type: String,
      required: true,
    },
    api: {
      type: String,
      required: true,
    },
    requestParams: {
      type: Object,
      required: false,
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

const DownloadParentReq = model<IDownloadParentReq & Document>(
  "download_parent_req",
  downloadParentReqSchema
);

export default DownloadParentReq;

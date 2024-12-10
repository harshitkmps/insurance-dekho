import { model, Schema, Document } from "mongoose";
import { CHILD_API_STATUS } from "@/constants/upload.constants";
import { IUploadChildReqSchema } from "@/interfaces/upload-child-req-schema.interface";

const uploadChildApiReqSchema: Schema = new Schema(
  {
    hitCount: {
      type: Number,
      required: true,
    },
    parentRequestId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(CHILD_API_STATUS),
      default: CHILD_API_STATUS.PRODUCED,
      index: true,
    },
    requestParams: {
      type: Schema.Types.Mixed,
      required: true,
    },
    apiResponse: {
      type: Object,
    },
    config: {
      type: Schema.Types.Mixed,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    sheetName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const UploadChildReq = model<IUploadChildReqSchema & Document>(
  "upload_child_req",
  uploadChildApiReqSchema
);

export default UploadChildReq;

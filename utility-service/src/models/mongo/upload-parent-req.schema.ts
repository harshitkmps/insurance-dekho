import { model, Schema, Document } from "mongoose";
import { IUploadParentReqSchema } from "@interfaces/upload-parent-req-schema.interface";
import { PARENT_API_STATUS } from "@/constants/upload.constants";

const updateParentReqSchema: Schema = new Schema(
  {
    status: {
      type: String,
      enum: Object.values(PARENT_API_STATUS),
      default: PARENT_API_STATUS.PRODUCED,
    },
    userEmail: {
      type: String,
      required: true,
    },
    iamUuid: {
      type: String,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    apiConfig: {
      type: Schema.Types.Mixed,
      required: true,
    },
    requestParams: {
      type: Schema.Types.Mixed,
      required: false,
    },
    source: {
      type: String,
      required: true,
    },
    requestFileLink: {
      type: Schema.Types.Mixed,
      default: "",
    },
    responseFileLink: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const UploadParentReq = model<IUploadParentReqSchema & Document>(
  "upload_parent_req",
  updateParentReqSchema
);

export default UploadParentReq;

import { model, Schema, Document } from "mongoose";
import { IGstDetailsParentReqSchema } from "@/interfaces/gst-details-parent-req.interface";

const gstDetailsParentReqSchema: Schema = new Schema(
  {
    iamUuid: {
      type: String,
    },
    gcdCode: {
      type: String,
    },
    pan: {
      type: String,
    },
    gstResponseReqId: {
      type: String,
    },
    hitCount: {
      type: Number,
    },
    status: {
      type: String,
    },
    response: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

const GstDetailsParentReq = model<IGstDetailsParentReqSchema & Document>(
  "gst_details_parent_req",
  gstDetailsParentReqSchema
);

export default GstDetailsParentReq;

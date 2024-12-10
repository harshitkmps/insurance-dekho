import { IConfigSchema } from "@/interfaces/config-schema.interface";
import { model, Schema, Document } from "mongoose";

const configSchema: Schema = new Schema(
  {
    configKey: {
      type: String,
      required: true,
      unique: true,
    },
    configValue: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Config = model<IConfigSchema & Document>("config", configSchema);

export default Config;

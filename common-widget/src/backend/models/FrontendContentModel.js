const mongoose = require("mongoose");

const frontendContent = new mongoose.Schema(
  {
    targetLOBs: { type: Array, required: true },
    typeOfContent: { type: String, required: true },
    contentProps: Object,
    active: { type: Boolean, default: true },
    criteria: { type: Object },
  },
  { collection: "frontend_contents", timestamps: true }
);

const FrontendContent = mongoose.model("frontendContent", frontendContent);

module.exports = FrontendContent;

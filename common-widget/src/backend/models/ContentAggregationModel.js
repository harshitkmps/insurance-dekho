const mongoose = require("mongoose");

const contentAggregationSchema = new mongoose.Schema(
  {
    product: { type: String, required: true },
    aggregatedArr: Array,
    category: { type: String, required: true },
    updatedAt: { type: Date, required: true, default: Date.now },
  },
  { collection: "content_aggregation" }
);

const contentAggregation = mongoose.model(
  "contentAggregation",
  contentAggregationSchema
);

module.exports = contentAggregation;

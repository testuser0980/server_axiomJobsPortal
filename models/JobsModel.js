const mongoose = require("mongoose");
const { Schema } = mongoose;

const JobsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    aboutCompany: {
      type: String,
      default: "",
    },
    companyLogo: {
      type: String,
      default: "",
    },
    jobTitle: {
      type: String,
      required: true,
    },
    jobLongDescription: {
      type: String,
      required: true,
    },
    jobCategory: {
      type: String,
      required: true,
    },
    jobLocation: {
      type: String,
      required: true,
    },
    jobNature: {
      type: String,
      required: true,
      default: "full time",
    },
    applied: {
      type: Boolean,
      default: false,
    },
    totalPositions: {
      type: Number,
      default: 0,
    },
    remainingPositions: {
      type: Number,
      default: 0,
    },
    deadLine: {
      type: Date,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("job", JobsSchema);

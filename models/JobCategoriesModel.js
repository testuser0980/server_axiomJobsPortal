const mongoose = require("mongoose");
const { Schema } = mongoose;

const JobCategoriesSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    totalJobs: {
      type: Number,
      default: 0,
    },
    companyLogo: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobCategories", JobCategoriesSchema);

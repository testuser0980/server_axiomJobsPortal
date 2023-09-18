const mongoose = require("mongoose");
const { Schema } = mongoose;

const ApplyForJobSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    jobName: {
      type: String,
      required: true,
    },
    jobCat: {
      type: String,
      required: true,
    },
    jobLoc: {
      type: String,
      required: true,
    },
    jobNature: {
      type: String,
      required: true,
    },
    stage: {
      type: String,
      default: "Applied",
    },
    candidatePersonalInfo: [
      {
        name: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
        phone: {
          type: String,
          required: true,
        },
        resume: {
          type: String,
          required: true,
        },
        coverLetter: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("jobapplication", ApplyForJobSchema);

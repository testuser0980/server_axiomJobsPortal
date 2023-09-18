const express = require("express");
const router = express.Router();
const User = require("../models/UserModel");
const Job = require("../models/JobsModel");
const JobApply = require("../models/ApplyForJobModel");
const VerifyUser = require("../middlewares/VerifyUser");
const verifyRole = require("../middlewares/VerifyRole");
const sendEmail = require("../utils/sendEmail");

// Apply for Job
router.post("/apply/job/:id", VerifyUser, async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).send({
        success: false,
        message:
          "Job not found with ID:" +
          req.params.id.slice(0, 4) +
          "..." +
          req.params.id.slice(req.params.id.length - 4),
      });
    }
    let userInfo = await User.findById(req.user);
    if (userInfo.role === "admin") {
      return res.status(400).send({
        success: false,
        message: "Admins cannot apply for this Job",
      });
    }
    let existsJobs = await JobApply.find();
    let checkIfAlreadyExists = existsJobs.filter((curElem) => {
      return curElem.userId.toString() === req.user;
    });
    let filterByJobName = checkIfAlreadyExists.filter((curElem) => {
      return curElem.jobName === job.jobTitle;
    });

    if (filterByJobName.length > 0) {
      return res.status(400).send({
        success: false,
        message:
          "You have already applied for JOB: " +
          req.params.id.slice(0, 4) +
          "..." +
          req.params.id.slice(req.params.id.length - 4),
      });
    }
    const {
      jobName,
      jobCat,
      jobLoc,
      jobNature,
      name,
      email,
      phone,
      resume,
      coverLetter,
    } = req.body;
    let appliedJob = await JobApply.create({
      userId: req.user,
      jobId: req.params.id,
      jobName,
      jobCat,
      jobLoc,
      jobNature,
      candidatePersonalInfo: [
        {
          name,
          email,
          phone,
          resume,
          coverLetter,
        },
      ],
    });
    let updated = {};
    if (updated) {
      updated.applied = true;
      updated.remainingPositions =
        job.remainingPositions === 0 ? 0 : job.remainingPositions - 1;
    }
    job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: updated },
      { $new: true }
    );
    await sendEmail({
      email,
      subject: "Job application submitted successfully.",
      name: jobName,
      category: jobCat,
      location: jobLoc,
      nature: jobNature,
      status: "applied",
    });
    return res.status(201).send({
      success: true,
      appliedJob,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// Get all applied jobs for current user
router.get("/jobs/applied/all", VerifyUser, async (req, res) => {
  try {
    let appliedJobs = await JobApply.find();
    if (!appliedJobs) {
      return res.status(404).send({
        success: false,
        message:
          "Jobs not found for User ID: " +
          req.user.slice(0, 4) +
          "..." +
          req.user.slice(req.user.length - 4),
      });
    }
    let user = await User.findById(req.user);
    if (user.role === "admin") {
      return res.status(200).send({
        success: true,
        appliedJobs,
        total: appliedJobs.length,
      });
    }
    let filterJobs = appliedJobs.filter((curElem) => {
      return curElem.userId.toString() === req.user;
    });
    return res.status(200).send({
      success: true,
      filterJobs,
      total: appliedJobs.filterJobs,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// Get Spec applied job for current user
router.get("/job/applied/:id", VerifyUser, async (req, res) => {
  try {
    let appliedJob = await JobApply.findById(req.params.id);
    if (!appliedJob) {
      return res.status(404).send({
        success: false,
        message:
          "Jobs not found for User ID: " +
          req.params.id.slice(0, 4) +
          "..." +
          req.params.id.slice(req.params.id.length - 4),
      });
    }
    let user = await User.findById(req.user);
    if (user.role === "admin") {
      return res.status(200).send({
        success: true,
        appliedJob,
      });
    }
    return res.status(200).send({
      success: true,
      appliedJob,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// Update Job Application
router.put("/jobs/update/:id", verifyRole, async (req, res) => {
  try {
    let jobApplication = await JobApply.findById(req.params.id);
    if (!jobApplication) {
      return res.status(404).send({
        success: false,
        message:
          "Job Application not found with ID: " +
          req.params.id.slice(0, 4) +
          "..." +
          req.params.id.slice(req.params.id.length - 4),
      });
    }
    const { stage } = req.body;
    let updated = {};
    if (updated) {
      updated.stage = stage;
    }
    jobApplication = await JobApply.findByIdAndUpdate(
      req.params.id,
      { $set: updated },
      { $new: true }
    );
    return res.status(201).send({
      success: true,
      jobApplication,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// Delete job by ID
router.delete("/delete/job/:id", verifyRole, async (req, res) => {
  try {
    let jobapplication = await JobApply.findById(req.params.id);
    if (!jobapplication) {
      return res.status(404).send({
        success: false,
        message:
          "Job Application not found with ID: " +
          req.params.id.slice(0, 4) +
          "..." +
          req.params.id.slice(req.params.id.length - 4),
      });
    }
    let job = await Job.find(jobapplication.jobId);
    let updated = {};
    if (updated) {
      updated.applied =
        job[0].remainingPositions === job[0].totalPositions ? false : true;
      updated.remainingPositions =
        job[0].remainingPositions > job[0].totalPositions
          ? job[0].totalPositions
          : job[0].remainingPositions + 1;
    }
    job = await Job.findByIdAndUpdate(
      jobapplication.jobId,
      { $set: updated },
      { $new: true }
    );
    jobapplication = await JobApply.findByIdAndDelete(req.params.id);
    return res.status(200).send({
      success: true,
      message:
        "Job Application deleted successfully with ID: " +
        req.params.id.slice(0, 4) +
        "..." +
        req.params.id.slice(req.params.id.length - 4),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;

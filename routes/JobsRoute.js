const express = require("express");
const router = express.Router();
const Users = require("../models/UserModel");
const Jobs = require("../models/JobsModel");
const JobApply = require("../models/ApplyForJobModel");
const Categories = require("../models/JobCategoriesModel");
const verifyRole = require("../middlewares/VerifyRole");

// Create Job - admin
router.post("/create/job", verifyRole, async (req, res) => {
  try {
    const {
      jobTitle,
      jobCategory,
      jobLocation,
      jobNature,
      totalPositions,
      jobLongDescription,
      deadLine,
    } = req.body;
    let job = await Jobs.findOne({ jobTitle });
    if (job) {
      return res.status(302).send({
        success: false,
        message: "Job with Same title already exists",
      });
    }
    let user = await Users.findById(req.user);
    job = await Jobs.create({
      userId: user._id,
      author: user.name,
      jobTitle,
      jobCategory,
      jobLocation,
      jobNature,
      totalPositions,
      remainingPositions: totalPositions,
      jobLongDescription,
      deadLine,
      aboutCompany: user.aboutCompany,
      companyLogo: user.companyLogo,
    });
    async function catsFilter(name) {
      let category = await Categories.find();
      let jobs = await Jobs.find();
      const catsFromJobs = jobs.filter((curElem) => {
        return curElem.jobCategory === name;
      });
      const catsFilter = category.filter((curElem) => {
        return curElem.name === name;
      });
      let updated = {};
      if (updated) {
        updated.totalJobs = catsFromJobs.length;
      }
      category = await Categories.findByIdAndUpdate(
        catsFilter[0]._id,
        { $set: updated },
        { new: true }
      );
    }
    catsFilter(jobCategory);
    return res.status(201).send({
      success: true,
      message: "Job has been created successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get all Jobs
router.get("/jobs/all", async (req, res) => {
  try {
    const jobs = await Jobs.find();
    return res.status(200).send({
      success: true,
      jobs,
      total: jobs.length,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get Job By ID
router.get("/job/:id", async (req, res) => {
  try {
    let job = await Jobs.findById(req.params.id);
    if (!job) {
      return res.status(404).send({
        success: false,
        message:
          "Job not found with ID: " +
          req.params.id.slice(0, 4) +
          "..." +
          req.params.id.slice(req.params.id.length - 4),
      });
    }
    return res.status(200).send({
      success: true,
      job,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get Job By Category Name
router.get("/category/:name", async (req, res) => {
  try {
    let jobs = await Jobs.find();
    if (!jobs) {
      return res.status(404).send({
        success: false,
        message: "No Jobs Available",
      });
    }
    let JobsByCategory = jobs.filter((job) => {
      return (
        job.jobCategory.toLowerCase().replaceAll(" ", "-") === req.params.name
      );
    });
    return res.status(200).send({
      success: true,
      JobsByCategory,
      total: JobsByCategory.length,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update Job - admin
router.put("/job/update/:id", verifyRole, async (req, res) => {
  try {
    let job = await Jobs.findById(req.params.id);
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
    let {
      jobTitle,
      jobCategory,
      jobLocation,
      jobNature,
      totalPositions,
      remainingPositions,
      jobLongDescription,
      deadLine,
    } = req.body;
    let catUpdate = async () => {
      const category = await Categories.find();
      let updateTotalOld = category.filter((curElem) => {
        if (jobCategory !== job.jobCategory) {
          return curElem.name === job.jobCategory;
        }
      });
      if (updateTotalOld.length > 0) {
        let updatedTotalOld = {};
        if (updatedTotalOld) {
          updatedTotalOld.totalJobs = updateTotalOld[0].totalJobs - 1;
        }
        console.log("old", updatedTotalOld);
        await Categories.findByIdAndUpdate(
          updateTotalOld[0]._id,
          { $set: updatedTotalOld },
          { new: true }
        );
      }
    };
    catUpdate();
    let filterCatWithUpdatedName = async (name) => {
      const category = await Categories.find();
      let filterCat = category.filter((curElem) => {
        if (name !== job.jobCategory) {
          return curElem.name === name;
        }
      });
      if (filterCat.length > 0) {
        let updatedCat = {};
        if (updatedCat) {
          updatedCat.totalJobs = filterCat[0].totalJobs + 1;
        }
        console.log("new", updatedCat);
        await Categories.findByIdAndUpdate(
          filterCat[0]._id,
          { $set: updatedCat },
          { new: true }
        );
      }
    };
    filterCatWithUpdatedName(jobCategory);
    let updated = {};
    if (updated) {
      updated.jobTitle = jobTitle || job.jobTitle;
      updated.jobCategory = jobCategory || job.jobCategory;
      updated.jobLocation = jobLocation || job.jobLocation;
      updated.jobNature = jobNature || job.jobNature;
      updated.totalPositions = totalPositions || job.totalPositions;
      updated.remainingPositions = remainingPositions || job.remainingPositions;
      updated.jobLongDescription = jobLongDescription || job.jobLongDescription;
      updated.deadLine = deadLine || job.deadLine;
    }
    job = await Jobs.findByIdAndUpdate(
      req.params.id,
      { $set: updated },
      { new: true }
    );
    return res.status(201).send({
      success: true,
      message:
        "Job has been updated with ID:" +
        req.params.id.slice(0, 4) +
        "..." +
        req.params.id.slice(req.params.id.length - 4),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
});

// Delete Job - admin
router.delete("/job/delete/:id", async (req, res) => {
  try {
    let job = await Jobs.findById(req.params.id);
    if (!job) {
      return res.status(404).send({
        success: false,
        message:
          "No Job found with ID:" +
          req.params.id.slice(0, 4) +
          "..." +
          req.params.id.slice(req.params.id.length - 4),
      });
    }
    const filterCat = async (name) => {
      let cats = await Categories.find();
      let filteredCats = cats.filter((curElem) => {
        return curElem.name === name;
      });
      let updated = {};
      if (updated) {
        updated.totalJobs =
          filteredCats[0].totalJobs < 0 ? 0 : filteredCats[0].totalJobs - 1;
      }
      await Categories.findByIdAndUpdate(
        filteredCats[0]._id,
        { $set: updated },
        { new: true }
      );
    };
    filterCat(job.jobCategory);
    const filterJobApplications = async (jobId) => {
      let jobApplications = await JobApply.find();
      let filteredApplications = jobApplications.filter((curElem) => {
        return curElem.jobId.toString() === jobId.toString();
      });
      let jobIds = [];
      for (let i = 0; i < filteredApplications.length; i++) {
        jobIds.push(filteredApplications[i]._id);
      }
      filteredApplications = await JobApply.deleteMany({
        _id: { $in: jobIds },
      });
    };
    filterJobApplications(job._id);
    job = await Jobs.findByIdAndDelete(req.params.id);
    return res.status(200).send({
      success: true,
      message:
        "Job deleted successfully with ID:" +
        req.params.id.slice(0, 4) +
        "..." +
        req.params.id.slice(req.params.id.length - 4),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;

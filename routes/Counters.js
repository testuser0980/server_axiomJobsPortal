const express = require("express");
const router = express.Router();
const verifyUser = require("../middlewares/VerifyUser");
const User = require("../models/UserModel");
const Categories = require("../models/JobCategoriesModel");
const Jobs = require("../models/JobsModel");
const Applications = require("../models/ApplyForJobModel");

router.get("/counters", verifyUser, async (req, res) => {
  try {
    const total_users = await User.find();
    const total_categories = await Categories.find();
    const total_jobs = await Jobs.find();
    const total_applications = await Applications.find();
    const currentUser_total_applications = total_applications.filter(
      (curElem) => {
        return curElem.userId.toString() === req.user;
      }
    );
    if (
      !total_users ||
      !total_categories ||
      !total_jobs ||
      !total_applications
    ) {
      return res.status(404).send({
        success: false,
        message: "Nothing to be counted.",
      });
    }
    return res.status(200).send({
      success: true,
      counters: {
        total_users: total_users.length,
        total_categories: total_categories.length,
        total_jobs: total_jobs.length,
        total_applications: total_applications.length,
        currentUser_total_applications:
          currentUser_total_applications &&
          currentUser_total_applications.length,
      },
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

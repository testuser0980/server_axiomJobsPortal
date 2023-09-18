const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const Categories = require("../models/JobCategoriesModel");
const Jobs = require("../models/JobsModel");
const JobApplications = require("../models/ApplyForJobModel");
const VerifyUser = require("../middlewares/VerifyUser");
const VerifyRole = require("../middlewares/VerifyRole");
const JWT_SEC = process.env.JWT_SEC;
// const generator = require("generate-password");

// Create User
router.post(
  "/user/create",
  [body("email", "Email is required").isEmail()],
  async (req, res) => {
    try {
      const errors = validationResult(body);
      if (!errors.isEmpty()) {
        return res.status(500).send({ errors: errors.array() });
      }
      const { email, password, profile } = req.body;
      let users = await User.find();
      let user = await User.findOne({ email: email });
      if (user) {
        return res
          .status(400)
          .send({ success: false, message: "User already exists" });
      }
      let e = email.split("@");
      const username = e[0].replace(".", "-");
      // const random_pass = generator.generate({
      //   length: 10,
      //   numbers: true,
      // });
      const salt = await bcrypt.genSalt(10);
      const hashPass = await bcrypt.hash(password, salt);
      user = await User.create({
        name: username,
        email,
        password: hashPass,
        profile,
        role: users.length === 0 ? "admin" : "user",
      });
      return res.status(201).send({ success: true, user });
    } catch (error) {
      console.log(error.message);
      return res
        .status(500)
        .send({ success: false, message: "Internal server error" });
    }
  }
);

// Create User - Admin
router.post(
  "/admin/create/user",
  VerifyRole,
  [body("email", "Email is required").isEmail()],
  async (req, res) => {
    try {
      const errors = validationResult(body);
      if (!errors.isEmpty()) {
        return res.status(500).send({ errors: errors.array() });
      }
      const { email, password, profile, role } = req.body;
      let user = await User.findOne({ email: email });
      if (user) {
        return res
          .status(400)
          .send({ success: false, message: "User already exists" });
      }
      let e = email.split("@");
      const username = e[0].replace(".", "-");
      // const random_pass = generator.generate({
      //   length: 10,
      //   numbers: true,
      // });
      const salt = await bcrypt.genSalt(10);
      const hashPass = await bcrypt.hash(password, salt);
      user = await User.create({
        name: username,
        email,
        password: hashPass,
        profile,
        role,
      });
      return res.status(201).send({ success: true, user });
    } catch (error) {
      console.log(error.message);
      return res
        .status(500)
        .send({ success: false, message: "Internal server error" });
    }
  }
);

// Login User
router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ success: false, message: "No user found" });
    }
    let comparePass = await bcrypt.compare(password, user.password);
    if (!comparePass) {
      return res.status(404).send({ success: false, message: "No user found" });
    }
    let payload = {
      id: {
        user: user.id,
      },
    };
    let authToken = await jwt.sign(payload, JWT_SEC);
    return res.status(200).send({ success: true, authToken });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
});

// Get logged in User Details
router.get("/user", VerifyUser, async (req, res) => {
  let user = await User.findById(req.user).select("-password");
  if (!user) {
    return res.status(404).send({
      success: false,
      message:
        "No User found with ID: " +
        req.user.slice(0, 4) +
        "..." +
        req.user.slice(req.user.length - 4),
    });
  }
  return res.status(200).send({
    success: true,
    user,
  });
});

// Get all Users - admin
router.get("/users/all", VerifyRole, async (req, res) => {
  try {
    let users = await User.find();
    return res.status(200).send({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update Records - Login Required
router.put("/user/records/update/:id", VerifyUser, async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message:
          "No user found with ID:" +
          req.params.id.slice(0, 4) +
          "..." +
          req.params.id.slice(req.params.id.length - 4),
      });
    }
    let { name, password, profile, aboutCompany, companyLogo } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);
    let updated = {};
    if (updated) {
      updated.name = name || user.name;
      updated.password = hashPass || user.password;
      updated.profile = profile || user.profile;
      updated.aboutCompany = aboutCompany;
      updated.companyLogo = companyLogo;
    }
    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updated },
      { new: true }
    );
    if (user.role === "admin") {
      let categories = await Categories.find();
      let jobs = await Jobs.find();
      let currentAdminCats = categories.filter((curElem) => {
        return curElem.userId.toString() === req.params.id;
      });
      let currentAdminJobs = jobs.filter((curElem) => {
        return curElem.userId.toString() === req.params.id;
      });
      let catIds = [];
      let jobIds = [];
      for (let i = 0; i < currentAdminCats.length; i++) {
        catIds.push(currentAdminCats[i]._id.toString());
      }
      for (let i = 0; i < currentAdminJobs.length; i++) {
        jobIds.push(currentAdminJobs[i]._id.toString());
      }
      let updated_cats = {};
      let updated = {};
      if (updated_cats) {
        updated_cats.companyLogo = user.companyLogo;
      }
      if (updated) {
        updated.author = user.name;
        updated.aboutCompany = user.aboutCompany;
        updated.companyLogo = user.companyLogo;
      }
      categories = await Categories.updateMany(
        { _id: { $in: catIds } },
        { $set: updated_cats },
        { $new: true }
      );
      jobs = await Jobs.updateMany(
        { _id: { $in: jobIds } },
        { $set: updated },
        { $new: true }
      );
    }
    return res.status(201).send({
      success: true,
      message:
        "User has been updated with ID: " +
        req.params.id.slice(0, 4) +
        "..." +
        req.params.id.slice(req.params.id.length - 4),
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
});

// Update Records - Login Required
router.put("/admin/records/update/user/:id", VerifyRole, async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message:
          "No user found with ID:" +
          req.params.id.slice(0, 4) +
          "..." +
          req.params.id.slice(req.params.id.length - 4),
      });
    }
    let { name, password, profile, role, aboutCompany, companyLogo } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);
    let updated = {};
    if (updated) {
      updated.name = name || user.name;
      updated.password = hashPass || user.password;
      updated.profile = profile || user.profile;
      updated.role = role || user.role;
      updated.aboutCompany = aboutCompany;
      updated.companyLogo = companyLogo;
    }
    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updated },
      { new: true }
    );
    if (user.role === "admin") {
      let jobs = await Jobs.find();
      let currentAdminJobs = jobs.filter((curElem) => {
        return curElem.userId.toString() === req.params.id;
      });
      let ids = [];
      for (let i = 0; i < currentAdminJobs.length; i++) {
        ids.push(currentAdminJobs[i]._id.toString());
      }
      let updated = {};
      if (updated) {
        updated.author = user.name;
      }
      jobs = await Jobs.updateMany(
        { _id: { $in: ids } },
        { $set: updated },
        { $new: true }
      );
    }
    return res.status(201).send({
      success: true,
      message:
        "User has been updated with ID: " +
        req.params.id.slice(0, 4) +
        "..." +
        req.params.id.slice(req.params.id.length - 4),
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
});

// Delete User
router.delete("/user/delete/:id", VerifyUser, async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message:
          "User not found with ID:" +
          req.params.id.slice(0, 4) +
          "..." +
          req.params.id.slice(req.params.id.length - 4),
      });
    }
    if (user.role === "user") {
      let jobApplications = await JobApplications.find();
      let filterJobApplications = jobApplications.filter((curElem) => {
        return curElem.userId.toString() === req.params.id;
      });
      let ids = [];
      for (let i = 0; i < filterJobApplications.length; i++) {
        ids.push(filterJobApplications[i]._id.toString());
      }
      jobApplications = await JobApplications.deleteMany({ _id: { $in: ids } });
      user = await User.findByIdAndDelete(req.params.id);
      return res.status(200).send({
        success: true,
        message:
          "User deleted successfully with ID:" +
          req.params.id.slice(0, 4) +
          "..." +
          req.params.id.slice(req.params.id.length - 4),
      });
    }
    // user = await User.findByIdAndDelete(req.params.id);
    return res.status(200).send({
      success: true,
      message:
        "User deleted successfully with ID:" +
        req.params.id.slice(0, 4) +
        "..." +
        req.params.id.slice(req.params.id.length - 4),
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
});

// Delete User By Admin
router.delete("/admin/delete/user/:id", VerifyRole, async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message:
          "User not found with ID:" +
          req.params.id.slice(0, 4) +
          "..." +
          req.params.id.slice(req.params.id.length - 4),
      });
    }
    if (user.role === "user") {
      let jobApplications = await JobApplications.find();
      let filterJobApplications = jobApplications.filter((curElem) => {
        return curElem.userId.toString() === req.params.id;
      });
      let ids = [];
      for (let i = 0; i < filterJobApplications.length; i++) {
        ids.push(filterJobApplications[i]._id.toString());
      }
      jobApplications = await JobApplications.deleteMany({ _id: { $in: ids } });
      user = await User.findByIdAndDelete(req.params.id);
      return res.status(200).send({
        success: true,
        message:
          "User deleted successfully with ID:" +
          req.params.id.slice(0, 4) +
          "..." +
          req.params.id.slice(req.params.id.length - 4),
      });
    }
    let jobApplications = await JobApplications.find();
    let jobs = await Jobs.find();
    let categories = await Categories.find();
    let users = await User.find();
    let jobAppliIds = [];
    let jobIds = [];
    let catIds = [];
    let usersIds = [];
    for (let i = 0; i < jobApplications.length; i++) {
      jobAppliIds.push(jobApplications[i]._id.toString());
    }
    for (let i = 0; i < jobs.length; i++) {
      jobIds.push(jobs[i]._id.toString());
    }
    for (let i = 0; i < categories.length; i++) {
      catIds.push(categories[i]._id.toString());
    }
    for (let i = 0; i < users.length; i++) {
      usersIds.push(users[i]._id.toString());
    }
    jobApplications = await JobApplications.deleteMany({
      _id: { $in: jobAppliIds },
    });
    jobs = await Jobs.deleteMany({
      _id: { $in: jobIds },
    });
    categories = await Categories.deleteMany({
      _id: { $in: catIds },
    });
    users = await User.deleteMany({
      _id: { $in: usersIds },
    });
    return res.status(200).send({
      success: true,
      message: "All Data has been deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const User = require("../models/UserModel");
const Categories = require("../models/JobCategoriesModel");
const VerifyRole = require("../middlewares/VerifyRole");

// Create Category - Admin
router.post("/category/create", VerifyRole, async (req, res) => {
  try {
    const { name } = req.body;
    let category = await Categories.findOne({ name: name });
    if (category) {
      return res.status(302).send({
        success: false,
        message: "Category with Same Title already exists",
      });
    }
    const user = await User.findById(req.user);
    category = await Categories.create({
      userId: req.user,
      name,
      companyLogo: user.companyLogo,
    });
    return res.status(201).send({
      success: true,
      category,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get all Categories
router.get("/categories/all", async (req, res) => {
  try {
    let categories = await Categories.find();
    // if (categories.length === 0) {
    //   return res.status(404).send({
    //     success: false,
    //     message: "No Categories found",
    //   });
    // }
    return res.status(200).send({
      success: true,
      categories,
      total: categories.length,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
});

// Delete category - admin
router.delete("/category/delete/:id", VerifyRole, async (req, res) => {
  try {
    let category = await Categories.findById(req.params.id);
    if (!category) {
      return res.status(404).send({
        success: false,
        message:
          "Category not found with ID:" +
          req.params.id.slice(0, 4) +
          "..." +
          req.params.id.slice(req.params.id.length - 4),
      });
    }
    category = await Categories.findByIdAndDelete(req.params.id);
    return res.status(200).send({
      success: true,
      message:
        "Category deleted successfully with ID:" +
        req.params.id.slice(0, 4) +
        "..." +
        req.params.id.slice(req.params.id.length - 4),
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;

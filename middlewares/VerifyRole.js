const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const JWT_SEC = process.env.JWT_SEC;

const VerifyRole = async (req, res, next) => {
  try {
    let { authtoken } = req.headers;
    if (!authtoken) {
      return res.status(404).send({
        success: false,
        message: "Authentication failed",
      });
    }
    let decode_jwt = await jwt.verify(authtoken, JWT_SEC);
    req.user = decode_jwt.id.user;
    let user = await User.findOne(decode_jwt.id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message:
          "No User found with ID:" +
          user.id.toString().slice(0, 4) +
          "..." +
          user.id.toString().slice(user.id.toString().length - 4),
      });
    }
    if (user.role !== "admin") {
      return res.status(400).send({
        success: false,
        message: `Role "${user.role.toUpperCase()}" are not allowed to access this resource.`,
      });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = VerifyRole;

const express = require("express");
const jwt = require("jsonwebtoken");
const JWT_SEC = process.env.JWT_SEC;

const VerifyUser = async (req, res, next) => {
  try {
    let { authtoken } = req.headers;
    let authToken = authtoken;
    if (!authToken) {
      return res.status(404).send({
        success: false,
        message: "Authentication failed",
      });
    }
    let decode_jwt = await jwt.verify(authToken, JWT_SEC);
    req.user = decode_jwt.id.user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = VerifyUser;

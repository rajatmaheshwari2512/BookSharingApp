const express = require("express");
const bodyParser = require("body-parser");

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route("/").get((req, res, next) => {
  res.statusCode = 200;
  res.end();
});
module.exports = uploadRouter;

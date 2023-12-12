const express = require("express");
const router = express.Router();
const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const {
  ApproveCourse,
  GetDashboardData,
} = require("../Components/dashboardComponents");

router.route("/approvecourse").put(ApproveCourse);

router.route("/dashboarddata").get(GetDashboardData);

module.exports = router;

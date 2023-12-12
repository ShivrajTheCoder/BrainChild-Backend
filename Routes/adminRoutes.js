const express = require("express");
const router = express.Router();
const {
  ApproveCourse,
  GetDashboardData,
  AddTeacher,
} = require("../Controllers/adminController");
const { check } = require("express-validator");
const { CreateNewCourse } = require("../Controllers/teacherController");

router.route("/approvecourse").put(ApproveCourse);

router.route("/dashboarddata").get(GetDashboardData);

router.route("/addteacher").post([
  check("firstname").exists(),
  check("lastname").exists(),
  check("email").exists().isEmail(),
  check("password").exists().isLength({ min: 6 }), // Assuming a minimum length of 6 for the password
], AddTeacher);




module.exports = router;

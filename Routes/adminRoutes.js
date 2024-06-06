const express = require("express");
const router = express.Router();
const {
  ApproveCourse,
  GetDashboardData,
  AddTeacher,
  GetApprovalPendingCourses,
  GetApprovalPendingVideos,
  ApproveVideo,
  getAllSuggestions,
} = require("../Controllers/adminController");
const { check } = require("express-validator");
const { LoginAdmin } = require("../Controllers/authController");
const { RouterAsyncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");


router.route("/login")
    .post(RouterAsyncErrorHandler(async (req, res, next) => {
        LoginAdmin(req, res, next);
    }))

router.route("/approvecourse").put(ApproveCourse);

router.route("/dashboarddata").get(GetDashboardData);

router.route("/addteacher").post([
  check("firstname").exists(),
  check("lastname").exists(),
  check("email").exists().isEmail(),
  check("password").exists().isLength({ min: 6 }), // Assuming a minimum length of 6 for the password
], AddTeacher);

router.route("/getapprovalpendingcourses")
  .get(GetApprovalPendingCourses)

router.route("/getapprovalpendingvideos")
  .get(GetApprovalPendingVideos)

router.route("/approvevideo/:videoId")
  .put([
    check("videoId").exists().isMongoId()
  ],ApproveVideo)

router.route("/getallsuggestions")
  .get(getAllSuggestions)

module.exports = router;

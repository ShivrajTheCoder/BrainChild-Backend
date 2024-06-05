const express = require("express");
const router = express.Router();
const { getEnrolledCourses, getAllUsers, subscribeCourse, getAllParentRequest, acceptParentRequest, askForEnrollment, getAllTestsForUser, submitResponse, watchedVideo, updateUserTime, getUserTime, getTestReports } = require("../Controllers/userController");
const { LoginUser, SignupUser } = require("../Controllers/authController");
const User = require("../Models/User");
const { RouterAsyncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const { check, body, validationResult } = require("express-validator");

router.route("/login")
    .post(RouterAsyncErrorHandler(async (req, res, next) => {
        LoginUser(req, res, next);
    }))
router.route("/signup")
    .post(RouterAsyncErrorHandler(async (req, res, next) => {
        SignupUser(req, res, next);
    }))

router.route("/getenrolled/:childId")
    .get(getEnrolledCourses)

router.route("/subscribe")
    .post(subscribeCourse)

router.route("/getallusers")
    .get(getAllUsers)

router.route("/getallrequests/:childId")
    .get(getAllParentRequest);

router.route("/acceptrequest/:requestId")
    .post(acceptParentRequest)

router.route("/requestenrollment")
    .post([
        check("courseId").exists().isMongoId(),
        check("parentId").exists().isMongoId(),
        check("userId").exists().isMongoId(),
    ], askForEnrollment)

router.route("/getuserupcomingtests/:userId")
    .get([
        check("userId").exists().isMongoId(),
    ], getAllTestsForUser)

router.route("/submitresponse")
    .post([
        check("userId").exists().isMongoId(),
        check("testId").exists().isMongoId(),
        check("testResponse").exists().isArray().withMessage("testResponse must be an array"),
        check("testResponse.*.questionId").exists().isMongoId().withMessage("Each response must have a valid question ID"),
        check("testResponse.*.optionIndex").exists().isNumeric().notEmpty().withMessage("Each response must have a non-empty option")
    ], submitResponse)

router.route("/watchedvideo")
    .post([
        check("userId").exists().isMongoId(),
        check("videoId").exists().isMongoId(),
    ], watchedVideo);

router.route("/addtime")
    .post([
        check("userId").exists().isMongoId(),
        check("date").exists().isDate(),
        check("time").exists().isNumeric(),
    ], updateUserTime)

router.route("/getusertime/:userId")
    .get([
        check("userId").exists().isMongoId()
    ], getUserTime)

router.route("/gettestreport/:userId")
    .get([
        check("userId").exists().isMongoId()
    ], getTestReports)


module.exports = router;
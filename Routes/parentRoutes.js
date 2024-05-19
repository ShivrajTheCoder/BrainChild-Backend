const express=require("express");
const { getAllChildCourses, sendParentRequest, getCourseRequests, orderCourse, paymentSuccess } = require("../Controllers/parentController");
const { SignupParent, LoginParent } = require("../Controllers/authController");
const { RouterAsyncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const { check, body } = require("express-validator");
const router=express.Router();

router.route("/login")
    .post(RouterAsyncErrorHandler(async(req,res,next)=>{
        LoginParent(req,res,next);
    }))
router.route("/signup")
    .post(RouterAsyncErrorHandler(async(req,res,next)=>{
        SignupParent(req,res,next);
    }))
router.route("/getchildcourses/:parentId")
    .get(getAllChildCourses)

router.route("/sendparentrequest")
    .post(sendParentRequest);


router.route("/courserequest/:childId")
    .get([
        check().exists().isMongoId(),
    ],getCourseRequests)

router.route("/createorder")
    .post([
        body("course").exists().isMongoId()
    ],orderCourse)

router.route("/paymentsuccess/:razorpayOrderId")
    .post([
        check("razorpayOrderId").exists(),
    ],paymentSuccess)

module.exports=router;
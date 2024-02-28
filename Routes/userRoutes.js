const express=require("express");
const router=express.Router();

const { getEnrolledCourses, getAllUsers, subscribeCourse } = require("../Controllers/userController");
const {LoginUser,SignupUser} =require("../Controllers/authController");
const User = require("../Models/User");
const { RouterAsyncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
router.route("/login")
    .post(RouterAsyncErrorHandler(async(req,res,next)=>{
        LoginUser(req,res,next);
    }))
router.route("/signup")
    .post(RouterAsyncErrorHandler(async(req,res,next)=>{
        SignupUser(req,res,next);
    }))

router.route("/getenrolled/:childId")
    .get(getEnrolledCourses)

router.route("/subscribe")
    .post(subscribeCourse)

router.route("/getallusers")
    .get(getAllUsers)

module.exports=router;
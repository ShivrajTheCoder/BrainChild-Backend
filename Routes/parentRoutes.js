const express=require("express");
const { getAllChildCourses, sendParentRequest } = require("../Controllers/parentController");
const { SignupParent, LoginParent } = require("../Controllers/authController");
const { RouterAsyncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
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

module.exports=router;
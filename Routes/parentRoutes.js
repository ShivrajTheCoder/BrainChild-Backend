const express=require("express");
const { getAllChildCourses } = require("../Controllers/parentController");
const router=express.Router();

router.route("/getchildcourses")
    .post(getAllChildCourses)

module.exports=router;
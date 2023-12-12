const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const CourseModel = require("../Models/CourseModel");
const Course = require("../Models/CourseModel");
const User = require("../Models/User");
const { NotFoundError } = require("../Utilities/CustomErrors");

const exp=module.exports;

exp.ApproveCourse= RouterAsncErrorHandler(async(req,res,next)=>{
    const {courseId,approval}=req.body;
    try{
        const course =await Course.findByIdAndUpdate(courseId, { approved: approval },{new:true});
        if(course){
            return res.status(200).json({
                message:"response saved!",
            })
        }
        else{
            throw new NotFoundError("Course Not found!");
        }
    }
    catch(error){
        next(error);
    }
})

exp.GetDashboardData=RouterAsncErrorHandler(async(req,res,next)=>{
    try {
        const users= await User.find({});
        const activeCourses=await CourseModel.find({approved:true});
        const pendingApproval=await CourseModel.find({approved:false});
        const videos=await VideoModel.find({});
        return res.status(200).json({
            users:users.length,
            activeCourses:activeCourses.length,
            pendingApproval:pendingApproval.length,
            videos:videos.length,
        })
    } catch (error) {
        next(error);
    }
})
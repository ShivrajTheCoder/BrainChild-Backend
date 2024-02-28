const { RouterAsyncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const CourseModel = require("../Models/CourseModel");
const User = require("../Models/User");const { NotFoundError } = require("../Utilities/CustomErrors");
const exp = module.exports;

exp.getEnrolledCourses = RouterAsyncErrorHandler(async (req, res, next) => {
    const { childId } = req.params;
    try {
        const child = await User.findById(childId).populate("courses");

        if (!child) {
            throw new NotFoundError("User Not found!");
        }

        const { courses } = child;

        if (courses.length < 1) {
            throw new NotFoundError("No courses found!");
        }

        return res.status(200).json({
            message: "Courses Found!",
            courses
        });
    } catch (error) {
        next(error);
    }
});
exp.subscribeCourse = RouterAsyncErrorHandler(async (req, res, next) => {
    const { userId, courseId } = req.body;
    try {
        const user = await User.findById(userId);
        const course = await CourseModel.findById(courseId);
        if (!user || !course) {
            throw new NotFoundError("Course or User not found!");
        }
        user.courses.push(courseId);
        await user.save();
        return res.status(200).json({
            message: "Course subscribed successfully!",
            courseId
        });
    } catch (error) {
        next(error);
    }
});


exp.getAllUsers=RouterAsyncErrorHandler(async(req,res,next)=>{
    try{
        const users=await User.find({});
        return res.status(200).json({
            users
        })
    }
    catch(error){
        next(error);
    }
})// remove it 

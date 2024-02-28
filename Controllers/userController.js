const { RouterAsyncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const CourseModel = require("../Models/CourseModel");
const ParentModel = require("../Models/ParentModel");
const RequestModel = require("../Models/RequestModel");
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

exp.getAllParentRequest=RouterAsyncErrorHandler(async (req, res, next) => {
    const { childId } = req.params;
    try {
        const child = await User.findById(childId);
        if (!child) {
            throw new NotFoundError("User Not found!");
        }
        const {email}=child;
        const requests=await RequestModel.find({receiver:email});
        if(requests.length <1){
            throw new NotFoundError("No requests found!");
        }

        return res.status(200).json({
            message: "Courses Found!",
            requests
        });
    } catch (error) {
        next(error);
    }
});

exp.acceptParentRequest = RouterAsyncErrorHandler(async (req, res, next) => {
    const { requestId } = req.params;
    try {
        const request = await RequestModel.findById(requestId);
        if (!request) {
            throw new NotFoundError("No requests found!");
        }
        const { sender, receiver } = request;
        const child = await User.findOne({ email: sender }); // Use findOne instead of find
        const parent = await ParentModel.findOne({ email: receiver }); // Use findOne instead of find
        if (!child || !parent) {
            throw new NotFoundError("Child or Parent no longer exists");
        }
        child.parent = parent._id;
        parent.child = child._id;
        await child.save(); // Use save on the retrieved document
        await parent.save(); // Use save on the retrieved document
        return res.status(200).json({
            message: "Request accepted",
        });
    } catch (error) {
        next(error);
    }
});

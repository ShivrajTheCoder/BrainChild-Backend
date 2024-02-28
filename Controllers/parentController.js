const { RouterAsyncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const ParentModel = require("../Models/ParentModel");
const RequestModel = require("../Models/RequestModel");
const User = require("../Models/User");
const { NotFoundError, CustomError } = require("../Utilities/CustomErrors");
const exp = module.exports;

exp.sendParentRequest = RouterAsyncErrorHandler(async (req, res, next) => {
    const { parentEmail, childEmail } = req.body;
    try {
        const child = await User.findOne(childEmail);
        if (!child) {
            throw new NotFoundError("No such user found!");
        }
        const newReq = new RequestModel({
            parentEmail, childEmail
        })
        newReq = await newReq.save();
        return res.status(201).json({
            message: "Request sent!",
            request: newReq
        })
    }
    catch (error) {
        next(error);
    }
})

exp.getAllChildCourses = RouterAsyncErrorHandler(async (req, res, next) => {
    const { childId, parentId } = req.body;
    try {
        const child=await User.findById(childId)
                                        .populate("courses")
                                        .exec((error,user)=>{
                                            if(error){
                                                next(error);
                                            }
                                            return user;
                                        })
        const parent=await ParentModel.findById(parentId);
        if(!child || !parent){
            throw new NotFoundError("Child or Parent Not found!");
        }
        if(parent.child !== child._id){
            throw new CustomError(422,"Parent and child not match");
        }
        const {courses}=child;
        if(courses.length<1){
            throw new NotFoundError("No courses found!");
        }
        return res.status(200).json({
            message:"Courses Found!",
            courses
        })
    }
    catch (error) {
        next();
    }
})

exp.addVideoFeedback = RouterAsyncErrorHandler(async (req, res, next) => {
    try {

    }
    catch (error) {
        next();
    }
})

exp.addSuggestion = RouterAsyncErrorHandler(async (req, res, next) => {
    try {

    }
    catch (error) {
        next();
    }
})
const { RouterAsyncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const ParentModel = require("../Models/ParentModel");
const RequestModel = require("../Models/RequestModel");
const User = require("../Models/User");
const { NotFoundError, CustomError } = require("../Utilities/CustomErrors");
const exp = module.exports;

exp.sendParentRequest = RouterAsyncErrorHandler(async (req, res, next) => {
    const { parentEmail, childEmail } = req.body;
    try {
        const child = await User.findOne({ email: childEmail });
        const parent = await ParentModel.findOne({ email: parentEmail });
        if (!child || !parent) {
            throw new NotFoundError("No such user or parent found!");
        }
        const newReq = new RequestModel({
            sender: parentEmail, receiver: childEmail
        })
        const saved = await newReq.save();
        return res.status(201).json({
            message: "Request sent!",
            request: saved
        })
    }
    catch (error) {
        next(error);
    }
})

exp.getAllChildCourses = RouterAsyncErrorHandler(async (req, res, next) => {
    const { parentId } = req.params;
    try {
        const parent = await ParentModel.findById(parentId);
        if (!parent) {
            throw new NotFoundError("Parent not found!");
        }
        const childId = parent.child;
        if (!childId) {
            throw new NotFoundError("No child of parent");
        }
        const child = await User.findById(childId).populate("courses")
        if (!child) {
            throw new NotFoundError("Child Not found!");
        }
        const { courses } = child;
        if (!courses || courses.length === 0) {
            throw new NotFoundError("No courses found for the child!");
        }
        return res.status(200).json({
            message: "Courses Found!",
            courses
        });
    } catch (error) {
        next(error); // Pass the caught error to the error handling middleware
    }
});


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
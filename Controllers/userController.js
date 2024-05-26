const { validationResult } = require("express-validator");
const { RouterAsyncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const CourseModel = require("../Models/CourseModel");
const EnrollmentRequest = require("../Models/EnrollmentRequest");
const ParentModel = require("../Models/ParentModel");
const RequestModel = require("../Models/RequestModel");
const User = require("../Models/User");
const { NotFoundError, CustomError } = require("../Utilities/CustomErrors");
const TestModel = require("../Models/Exam/TestModel");
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


exp.getAllUsers = RouterAsyncErrorHandler(async (req, res, next) => {
    try {
        const users = await User.find({});
        return res.status(200).json({
            users
        })
    }
    catch (error) {
        next(error);
    }
})// remove it 

exp.getAllParentRequest = RouterAsyncErrorHandler(async (req, res, next) => {
    const { childId } = req.params;
    try {
        const child = await User.findById(childId);
        if (!child) {
            throw new NotFoundError("User Not found!");
        }
        const { email } = child;
        const requests = await RequestModel.find({ receiver: email });
        if (requests.length < 1) {
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


exp.askForEnrollment = RouterAsyncErrorHandler(async (req, res, next) => {
    const { courseId, userId, parentId } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const enreq = await EnrollmentRequest.find({ courseId, userId, parentId });
        console.log(enreq);
        if (enreq.length > 0) {
            return res.status(400).json({
                message: "request already exists",
            })
        }
        const course = await CourseModel.findById(courseId);
        const user = await User.findById(userId);
        const parent = await ParentModel.findById(parentId);
        if (!course || !user || !parentId) {
            throw new NotFoundError("User or Course or Parent not found!");
        }
        console.log(parent.child, user._id);
        if (!parent.child.equals(user._id)) {
            throw new CustomError(401, "Invalid child");
        }
        const newEnreq = new EnrollmentRequest({
            courseId, userId, parentId
        });
        console.log(newEnreq);
        const savedReq = await newEnreq.save();
        return res.status(201).json({
            message: "Course Requested for Parent",
            request: savedReq
        })
    }
    catch (error) {
        next(error);
    }
})

exp.getAllTestsForUser = RouterAsyncErrorHandler(async (req, res, next) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).populate({
            path: 'courses',
        });

        if (!user) {
            throw new NotFoundError("User Not found!");
        }

        const courses = user.courses;
        let allTests = [];

        for (const course of courses) {
            const courseTests = await TestModel.find({ course: course._id });
            if (courseTests.length > 0) {
                allTests = allTests.concat(courseTests);
            }
        }

        if (allTests.length < 1) {
            throw new NotFoundError("No tests found!");
        }

        return res.status(200).json({
            message: "Tests Found!",
            tests: allTests
        });
    } catch (error) {
        next(error);
    }
});
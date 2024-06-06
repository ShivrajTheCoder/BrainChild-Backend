const { validationResult } = require("express-validator");
const { RouterAsyncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const CourseModel = require("../Models/CourseModel");
const EnrollmentRequest = require("../Models/EnrollmentRequest");
const ParentModel = require("../Models/ParentModel");
const RequestModel = require("../Models/RequestModel");
const User = require("../Models/User");
const { NotFoundError, CustomError } = require("../Utilities/CustomErrors");
const TestModel = require("../Models/Exam/TestModel");
const QuestionModel = require("../Models/Exam/QuestionModel");
const TestResponseModel = require("../Models/Exam/TestResponseModel");
const resultAnalyser = require("../Utilities/ResultAnalyser");
const VideoModel = require("../Models/VideoModel");
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
        const requests = await RequestModel.find({ receiver: email }).populate("sender");
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
        const child = await User.findOne({ email: receiver }); 
        const parent = await ParentModel.findOne({ email: sender }); 
        // console.log(child,parent);
        if (!child || !parent) {
            throw new NotFoundError("Child or Parent no longer exists");
        }
        child.parent = parent._id;
        parent.child = child._id;
        await child.save(); 
        await parent.save(); 
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
            // console.log(courseTests)
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
const optionMap = {
    "A": 0,
    "B": 1,
    "C": 2,
    "D": 3
};
exp.submitResponse = RouterAsyncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, testId, testResponse } = req.body;

    try {
        let totalMarks = 0;
        let scoredMarks = 0;

        for (const response of testResponse) {
            const question = await QuestionModel.findById(response.questionId);

            if (!question) {
                return res.status(400).json({ error: `Question with ID ${response.questionId} not found` });
            }

            const correctIndex = optionMap[question.correct];
            const maxMarks = question.marks;

            // Increment total marks by the maximum marks for each question
            totalMarks += maxMarks;

            if (response.optionIndex === correctIndex) {
                // Increment scored marks by the maximum marks if the answer is correct
                scoredMarks += maxMarks;
            }
        }

        const newTestResponse = new TestResponseModel({
            userId,
            testId,
            responses: testResponse.map(r => ({
                question: r.questionId,
                option: r.optionIndex
            })),
            totalMarks,
            scored: scoredMarks
        });

        const savedResponse = await newTestResponse.save();

        const analysisResult = await resultAnalyser(savedResponse);
        if (analysisResult?.error) {
            throw new CustomError(500, "Analysis gone wrong but saved!");
        }
        if (analysisResult) {
            savedResponse.topicResults = analysisResult.result.map(r => ({
                topic_name: r.topic_name,
                result: r.result
            }));

            await savedResponse.save();
        }

        return res.status(201).json({
            message: "Response Submitted",
            totalMarks,
            scoredMarks,
            analysisResult
        });
    } catch (error) {
        next(error);
    }
});


exp.watchedVideo = RouterAsyncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, videoId } = req.body;

    try {
        const video = await VideoModel.findById(videoId);
        if (!video) {
            throw new NotFoundError("Video not found!");
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found!");
        }

        // Add videoId to watchedVideos array if it's not already present
        if (!user.watchedVideos.includes(videoId)) {
            user.watchedVideos.push(videoId);
            await user.save();
        }

        res.status(200).json({ message: "Video added to watched list." });
    } catch (error) {
        next(error);
    }
});
exp.updateUserTime = RouterAsyncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { userId, date, time } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const onlineTimeEntry = user.onlineTime.find(entry =>
            entry.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
        );

        if (onlineTimeEntry) {
            onlineTimeEntry.timeInSeconds += time;
        } else {
            user.onlineTime.push({ date: new Date(date), timeInSeconds: time });
        }
        await user.save();

        res.status(200).json({ message: "User time updated successfully", user });
    } catch (error) {
        next(error);
    }
});

exp.getUserTime = RouterAsyncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const { userId } = req.params;

    try {
        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const onlineTimeData = user.onlineTime;
        const currentDate = new Date();
        const past30Days = [];

        for (let i = 0; i < 30; i++) {
            const date = new Date(currentDate - (i * 24 * 60 * 60 * 1000));
            const dateString = date.toISOString().split('T')[0];
            const entry = onlineTimeData.find(entry => 
                entry.date.toISOString().split('T')[0] === dateString
            );
            past30Days.push({
                date: dateString,
                timeInMinutes: entry ? entry.timeInSeconds / 60 : 0
            });
        }

        past30Days.reverse(); 

        res.status(200).json({
            timeline:past30Days,
            message:"timeline found!"
        });
    } catch (error) {
        next(error);
    }
});

exp.getTestReports = RouterAsyncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { userId } = req.params;

        // Find test responses for the given userId
        const testReports = await TestResponseModel.find({ userId })
            .populate('testId') 
            .populate('responses.question') 
            .populate('topicResults') 
            .exec();

        if (!testReports) {
            return res.status(404).json({ error: "Test reports not found" });
        }

        res.status(200).json(testReports);
    } catch (error) {
        next(error);
    }
});


module.exports = exp;
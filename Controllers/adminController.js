const { RouterAsyncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const CourseModel = require("../Models/CourseModel");
const Course = require("../Models/CourseModel");
const Teacher = require("../Models/TeacherModel");
const User = require("../Models/User");
const bcrypt = require("bcrypt");
const { NotFoundError } = require("../Utilities/CustomErrors");
const VideoModel = require("../Models/VideoModel");
const { validationResult } = require("express-validator");
const SuggestionModel = require("../Models/SuggestionModel");

const exp = module.exports;

exp.ApproveCourse = RouterAsyncErrorHandler(async (req, res, next) => {
  const { courseId, approval } = req.body;
  try {
    const course = await Course.findByIdAndUpdate(courseId, { approved: approval }, { new: true });
    if (course) {
      return res.status(200).json({
        message: "response saved!",
      })
    }
    else {
      throw new NotFoundError("Course Not found!");
    }
  }
  catch (error) {
    next(error);
  }
})

exp.GetDashboardData = RouterAsyncErrorHandler(async (req, res, next) => {
  try {
    const users = await User.find({});
    const activeCourses = await CourseModel.find({ approved: true });
    const pendingApproval = await CourseModel.find({ approved: false });
    const videos = await VideoModel.find({});
    return res.status(200).json({
      users: users.length,
      activeCourses: activeCourses.length,
      pendingApproval: pendingApproval.length,
      videos: videos.length,
    })
  } catch (error) {
    next(error);
  }
})

exp.AddTeacher = RouterAsyncErrorHandler(async (req, res, next) => {
  const { firstname, lastname, email, password } = req.body;

  try {
    // Check if the email is already registered
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new teacher
    const newTeacher = new Teacher({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    // Save the teacher to the database
    const savedTeacher = await newTeacher.save();

    res.status(201).json({
      message: "Teacher added successfully",
      teacher: savedTeacher,
    });
  } catch (error) {
    next(error);
  }
});

exp.GetApprovalPendingCourses = RouterAsyncErrorHandler(async (req, res, next) => {
  try {
    const pendingApprovalCourses = await CourseModel.find({ approved: false });
    return res.status(200).json({
      pendingApprovalCourses: pendingApprovalCourses.length,
      courses: pendingApprovalCourses,
      message: "Approval pending courses retrieved successfully!",
    });
  } catch (error) {
    next(error);
  }
});

exp.GetApprovalPendingVideos = RouterAsyncErrorHandler(async (req, res, next) => {
  try {
    const pendingApprovalVideos = await VideoModel.find({ approved: false })
      .populate('author', 'username')
      .populate('course', 'name');
      
    return res.status(200).json({
      pendingApprovalVideos: pendingApprovalVideos.length,
      videos: pendingApprovalVideos,
      message: "Approval pending videos retrieved successfully!",
    });
  } catch (error) {
    next(error);
  }
});

exp.ApproveVideo = RouterAsyncErrorHandler(async (req, res, next) => {
  const { videoId } = req.params;
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
  try {
    const video = await VideoModel.findByIdAndUpdate(videoId, { approved: true }, { new: true });
    if (video) {
      return res.status(200).json({
        message: "Video approved successfully",
        video: video,
      });
    } else {
      throw new NotFoundError("Video not found");
    }
  } catch (error) {
    next(error);
  }
});


exp.getAllSuggestions = async (req, res, next) => {
  try {
      const suggestions = await SuggestionModel.find().populate('author').sort({ timestamp: -1 }).exec();
      if (!suggestions) {
          return res.status(404).json({ message: "No suggestions found" });
      }
      return res.status(200).json({ message: "Suggestions found successfully", data: suggestions });
  } catch (error) {
      next(error);
  }
};

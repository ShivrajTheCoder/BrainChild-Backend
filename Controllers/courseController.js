const { RouterAsyncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const Course = require("../Models/CourseModel");
const TeacherModel = require("../Models/TeacherModel");
const VideoModel = require("../Models/VideoModel");
const { CustomError, NotFoundError } = require("../Utilities/CustomErrors");
const { validationResult } = require("express-validator");

const exp = module.exports;

exp.CreateCourse = RouterAsyncErrorHandler(async (req, res, next) => {
  try {
    const { name, description, author } = req.body;
    if (!name || !description || !author) {
      return res.status(422).json({
        message: "All fileds are mandatory"
      })
    }
    if (!req.files) {
      return res.status(400).json({ error: "All fields are required" });
    }
    // console.log(req.files);
    const { thumbnail } = req.files;
    if (!thumbnail) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const thumbnailpath = "http://localhost:8080/media/" + thumbnail[0].filename;
    const coursef=await Course.find({name})
    console.log(coursef);
    if(coursef.length>0){
      return res.status(400).json({
        message:"Course already exists"
      })
    }
    const teacher = await TeacherModel.findById(author);
    if (!teacher) {
      throw new NotFoundError("Teacher Not found!");
    }
    // Create a new course
    const newCourse = new Course({
      name,
      description,
      author,
      thumbnail:thumbnailpath
    });
    // console.log(newCourse)
    const course = await newCourse.save();

    return res.status(201).json({
      message: "Course Created",
      course,
    });
  } catch (error) {
    next(error);
  }
});

exp.GetAllCourses = RouterAsyncErrorHandler(async (req, res, next) => {
  try {
    const courses = await Course.find();
    if (courses.length > 0) {
      return res.status(200).json({
        message: "Courses found",
        courses,
      });
    } else {
      throw new NotFoundError();
    }
  } catch (error) {
    next(error);
  }
});

exp.GetCourseById = RouterAsyncErrorHandler(async (req, res, next) => {
  const courseId = req.params.id;
  try {
    const course = await Course.findById(courseId).populate("videos").populate("author", "name"); // Adjust properties based on your Video and Teacher models
    if (!course) {
      throw new NotFoundError("Course Not Found");
    }
    return res.status(200).json({
      message: "Course Found",
      course,
    });
  } catch (error) {
    next(error);
  }
});

exp.UpdateCourse = RouterAsyncErrorHandler(async (req, res, next) => {
  const courseId = req.params.id;
  try {
    const { name, description, videos, author, enrolled } = req.body;

    // Validate data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError(400, "Validation Error", errors.array());
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        name,
        description,
        videos,
        author,
        enrolled,
      },
      { new: true }
    );

    if (!updatedCourse) {
      throw new NotFoundError("Course Not Found");
    }

    return res.status(200).json({
      message: "Course Updated",
      course: updatedCourse,
    });
  } catch (error) {
    next(error);
  }
});

exp.DeleteCourse = RouterAsyncErrorHandler(async (req, res, next) => {
  const courseId = req.params.id;
  try {
    const deletedCourse = await Course.findByIdAndDelete(courseId);
    if (!deletedCourse) {
      throw new NotFoundError("Course Not Found");
    }
    return res.status(200).json({
      message: "Course Deleted",
      course: deletedCourse,
    });
  } catch (error) {
    next(error);
  }
});
exp.GetAllCourseVideos = RouterAsyncErrorHandler(async (req, res, next) => {
  const courseId = req.params.courseId;
  try {
    const course = await Course.findById(courseId).populate("videos");
    if (!course) {
      throw new NotFoundError("Course Not Found");
    }
    return res.status(200).json({
      message: "Course Videos Found",
      videos: course.videos,
    });
  } catch (error) {
    next(error);
  }
});

// New function to get a video by its ID
exp.GetVideoById = RouterAsyncErrorHandler(async (req, res, next) => {
  const videoId = req.params.videoId;
  try {
    const video = await VideoModel.findById(videoId);
    if (!video) {
      throw new NotFoundError("Video Not Found");
    }
    return res.status(200).json({
      message: "Video Found",
      video,
    });
  } catch (error) {
    next(error);
  }
});
const { RouterAsyncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const Course = require("../Models/CourseModel");
const TeacherModel = require("../Models/TeacherModel");
const { CustomError, NotFoundError } = require("../Utilities/CustomErrors");
const { validationResult } = require("express-validator");

const exp = module.exports;

exp.CreateCourse = RouterAsyncErrorHandler(async (req, res, next) => {
  try {
    const { name, description, author } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError(400, "Validation Error", errors.array());
    }
    const teacher=await TeacherModel.findById(author);
    if(!teacher){
      throw new NotFoundError("Teacher Not found!");
    }
    // Create a new course
    const newCourse = new Course({
      name,
      description,
      author,
    });

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

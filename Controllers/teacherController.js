const { validationResult } = require("express-validator");
const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const CourseModel = require("../Models/CourseModel");
const Course = require("../Models/CourseModel");
const TeacherModel = require("../Models/TeacherModel");
const Teacher = require("../Models/TeacherModel");
const Video = require("../Models/VideoModel");
const { NotFoundError } = require("../Utilities/CustomErrors");
const exp = module.exports;

exp.UploadVideo = RouterAsncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { title, description, author } = req.body;
    try {
        const teacher = await Teacher.findById(author);
        if (!teacher) {
            throw new NotFoundError("Teacher Not Found");
        }
        const newVid = new Video({
            url: "xyz",
            title, description, author
        });
        await newVid.save();
        return res.status(201).json({
            message: "Video added",
        });
    } catch (e) {
        next(e);
    }
});

exp.DeleteVideo = RouterAsncErrorHandler(async (req, res, next) => {
    const { videoId } = req.query;
    await Video.findByIdAndDelete(videoId)
        .then(() => {
            return res.status(200).json({
                message: "Video delted successfully"
            })
        })
        .catch(e => {
            next(e);
        })
})


exp.UpdateVideo = RouterAsncErrorHandler(async (req, res, next) => {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const updated = await Video.findByIdAndUpdate(id, req.body, { new: true });
        return res.status(200).json({
            message: "Video updated",
            course: updated
        })
    }
    catch (error) {
        next(error);
    }
})

exp.GetMyCourses = RouterAsncErrorHandler(async (req, res, next) => {
    const { authorId } = req.params;
    try {
        const courses = await Course.find({ author: authorId });
        if (courses.length > 0) {
            return res.status(200).json({
                courses,
                message: "Found courses!",
            })
        }
        else {
            throw new NotFoundError("No courses found!");
        }
    }
    catch (error) {
        next(error);
    }
})

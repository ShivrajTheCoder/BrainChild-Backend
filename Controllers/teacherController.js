const { validationResult } = require("express-validator");
const { RouterAsyncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const Course = require("../Models/CourseModel");
const Teacher = require("../Models/TeacherModel");
const Video = require("../Models/VideoModel");
const fs = require("fs");
const { NotFoundError, CustomError } = require("../Utilities/CustomErrors");
const TestModel = require("../Models/Exam/TestModel");
const exp = module.exports;

exp.UploadVideo = RouterAsyncErrorHandler(async (req, res, next) => {
    const { title, description, author, course } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if (!title || !description || !author || !course) {
        throw new CustomError(422, "All Fields are mandatory");
    }

    if (!req.files) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const { thumbnail, video } = req.files;

    if (!thumbnail || !video) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const thumbnailpath = "http://localhost:8080/media/" + thumbnail[0].filename;
    const videopath = "http://localhost:8080/media/" + video[0].filename;

    try {
        // Check if a video with the same title already exists
        const existingVideo = await Video.findOne({ title });
        if (existingVideo) {
            throw new CustomError(409, "A video with this title already exists");
        }

        const teacher = await Teacher.findById(author);
        const coursef = await Course.findById(course);

        if (!teacher || !coursef) {
            throw new NotFoundError("Teacher or course not Found");
        }

        const newVid = new Video({
            title, description, author, course,
            videourl: videopath, thumbnail: thumbnailpath
        });

        await newVid.save();

        return res.status(201).json({
            message: "Video added",
            video: newVid
        });
    } catch (e) {
        if (thumbnail && thumbnail[0] && thumbnail[0].path) {
            fs.unlink(thumbnail[0].path, (err) => {
                if (err) {
                    console.error("Error deleting thumbnail:", err);
                }
            });
        }
        if (video && video[0] && video[0].path) {
            fs.unlink(video[0].path, (err) => {
                if (err) {
                    console.error("Error deleting video:", err);
                }
            });
        }
        next(e);
    }
});

exp.DeleteVideo = RouterAsyncErrorHandler(async (req, res, next) => {
    const { videoId } = req.query;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    await Video.findByIdAndDelete(videoId)
        .then(() => {
            return res.status(200).json({
                message: "Video deleted successfully"
            });
        })
        .catch(e => {
            next(e);
        });
});

exp.UpdateVideo = RouterAsyncErrorHandler(async (req, res, next) => {
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
        });
    } catch (error) {
        next(error);
    }
});

exp.GetMyCourses = RouterAsyncErrorHandler(async (req, res, next) => {
    const { authorId } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const courses = await Course.find({ author: authorId });
        if (courses.length > 0) {
            return res.status(200).json({
                courses,
                message: "Found courses!",
            });
        } else {
            throw new NotFoundError("No courses found!");
        }
    } catch (error) {
        next(error);
    }
});

// GetMyVideos function
exp.GetMyVideos = RouterAsyncErrorHandler(async (req, res, next) => {
    const { authorId } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const videos = await Video.find({ author: authorId }).populate('course', 'name');
        if (videos.length > 0) {
            const videosWithCourseNames = videos.map(video => ({
                ...video.toObject(),
                course: video.course.name
            }));
            return res.status(200).json({
                videos: videosWithCourseNames,
                message: "Found videos!",
            });
        } else {
            throw new NotFoundError("No videos found!");
        }
    } catch (error) {
        next(error);
    }
});
exp.GetTeacherInfo = RouterAsyncErrorHandler(async (req, res, next) => {
    const { authorId } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Get number of courses
        const coursesCount = await Course.countDocuments({ author: authorId });

        // Get total enrolled students
        const courses = await Course.find({ author: authorId });
        const totalEnrolled = courses.reduce((acc, course) => acc + course.enrolled, 0);

        // Get number of videos
        const videosCount = await Video.countDocuments({ author: authorId });

        
        const testsCount = await TestModel.countDocuments({ author: authorId });
        return res.status(200).json({
            coursesCount,
            totalEnrolled,
            videosCount,
            testsCount,
            message: "Teacher information retrieved successfully!",
        });
    } catch (error) {
        next(error);
    }
});

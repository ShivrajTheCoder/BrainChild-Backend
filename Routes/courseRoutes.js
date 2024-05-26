const express = require("express");
const router = express.Router();
const { check, validationResult, body } = require("express-validator");
const {
  CreateCourse,
  GetAllCourses,
  GetCourseById,
  UpdateCourse,
  DeleteCourse,
  GetAllCourseVideos,
  GetVideoById,
} = require("../Controllers/courseController");
const { CustomError } = require("../Utilities/CustomErrors");
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads') // Uploads folder where files will be stored
    },
    filename: function (req, file, cb) {
        // Use original file name with a timestamp to avoid overwriting files with the same name
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage })
const multipleUpload = upload.fields([{ name: "thumbnail", maxCount: 1 }])
const atLeastOne = (value, { req }) => {
  if (req.name || req.description || req.videos || req.author || req.enrolled) {
    return true;
  }

  throw new CustomError(400, "Invalid parameters", "Invalid");
};

// router.route("/createcourse").post([
//   check("name").exists(),
//   check("description").exists().isLength({ min: 10 }),
//   check("author").exists().isMongoId(),
// ], CreateCourse);
router.route("/createcourse").post(multipleUpload, CreateCourse);

router.route("/getallcourses").get(GetAllCourses);

router.route("/getcourse/:id").get([
  check("id").exists().isMongoId(),
], GetCourseById);

router.route("/updatecourse/:id").put([
  check("id").exists().isMongoId(),
  body("name").optional().isString(),
  body("description").optional().isString().isLength({ min: 10 }),
  body("videos").optional().isArray(),
  body("author").optional().isMongoId(),
  body("enrolled").optional().isNumeric(),
  body().custom(atLeastOne),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // No validation errors, proceed to the UpdateCourse handler
  UpdateCourse(req, res, next);
});

router.route("/deletecourse/:id").delete([
  check("id").exists().isMongoId(),
], DeleteCourse);

router.route("/getcoursevideos/:courseId").get([
  check("courseId").exists().isMongoId()
],GetAllCourseVideos)

router.route("/getvideosbyid/:videoId").get([
  check("videoId").exists().isMongoId()
],GetVideoById)

module.exports = router;

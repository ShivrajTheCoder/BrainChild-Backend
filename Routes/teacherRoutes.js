const express = require("express");
const router = express.Router();
const { check, body, validationResult } = require("express-validator");
const routeCredentialValidator = require("../Middlewares/CredentialsValidator");
const { UploadVideo, DeleteVideo, UpdateVideo, GetMyCourses, GetMyVideos, GetTeacherInfo } = require("../Controllers/teacherController");
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
// const upload = multer({ dest: 'uploads/' })
const upload = multer({ storage: storage })
const multipleUpload = upload.fields([{ name: "thumbnail", maxCount: 1 }, { name: "video", maxCount: 1 }])
const atLeastOne = (value, { req }) => {
    if (req.title || req.title) {
        return true;
    }

    throw new CustomError(400, "Invalid parameters", "Invalid")
}

router.route("/uploadvideo")
    .post(multipleUpload, UploadVideo)

router.route("/getallteachercourse/:authorId")
    .get([
        check("authorId").exists().isMongoId()
    ], GetMyCourses)
router.route("/getallteachervideos/:authorId")
    .get([
        check("authorId").exists().isMongoId()
    ], GetMyVideos)

router.route("/getteacherinfo/:authorId")
    .get([
        check("authorId").exists().isMongoId()
    ], GetTeacherInfo)


router.route("/deletevideo/:videoId")
    .delete([
        check("id").exists().isMongoId()
    ], DeleteVideo)


router.route("/updatevideo/:id")
    .put([
        check("id").exists().isMongoId(),
        body("title").optional().isString(),
        body("description").optional().isString().isLength({ min: 25 }),
        body().custom(atLeastOne)
    ], (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // No validation errors, proceed to the UpdateVideo handler
        UpdateVideo(req, res, next);
    })
module.exports = router;
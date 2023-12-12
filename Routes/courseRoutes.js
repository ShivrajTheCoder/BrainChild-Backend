const express = require("express");
const router = express.Router();
const { check, validationResult, body } = require("express-validator");
const routeCredentialValidator = require("../Middlewares/CredentialsValidator");
const {
  CreateCourse,
  GetAllCourses,
  GetCourseById,
  UpdateCourse,
  DeleteCourse,
} = require("../Controllers/courseController");
const { CustomError } = require("../Utilities/CustomErrors");

const atLeastOne = (value, { req }) => {
  if (req.name || req.description || req.videos || req.author || req.enrolled) {
    return true;
  }

  throw new CustomError(400, "Invalid parameters", "Invalid");
};

router.route("/createcourse").post((req,res,next)=>{
  console.log(req.body);
  return res.status(200).json({
    message:"Good"
  })
});

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

module.exports = router;

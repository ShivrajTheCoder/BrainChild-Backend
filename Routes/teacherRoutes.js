const express=require("express");
const router=express.Router();
const {check,body, validationResult}=require("express-validator");
const routeCredentialValidator=require("../Middlewares/CredentialsValidator");
const { UploadVideo, DeleteVideo, UpdateVideo } = require("../Controllers/teacherController");
const { CustomError } = require("../Utilities/CustomErrors");

const atLeastOne=(value,{req})=>{
    if(req.title || req.title){
        return true;
    }

    throw new CustomError(400,"Invalid parameters","Invalid")
}

router.route("/uploadvideo")
    .post([
        check("title").exists(),
        check("description").exists().isLength({min:10}),
        check("author").exists().isMongoId(),
    ],UploadVideo)

router.route("/deletevideo/:videoId")
    .delete([
        check("id").exists().isMongoId()
    ],DeleteVideo)

router.route("/updatevideo/:id")
    .put([
        check("id").exists().isMongoId(),
        body("title").optional().isString(),
        body("description").optional().isString().isLength({min:25}),
        body().custom(atLeastOne)
    ],(req,res,next)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // No validation errors, proceed to the UpdateVideo handler
        UpdateVideo(req, res, next);
    })
module.exports=router;
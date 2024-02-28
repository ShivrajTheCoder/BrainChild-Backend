const { RouterAsyncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const RequestModel = require("../Models/RequestModel");
const User =require("../Models/User");
const { NotFoundError } = require("../Utilities/CustomErrors");
const exp = module.exports;

exp.sendParentRequest=RouterAsyncErrorHandler(async(req,res,next)=>{
    const {parentEmail,childEmail}=req.body;
    try{
        const child=await User.findOne(childEmail);
        if(!child){
        throw new NotFoundError("No such user found!");
        }
        const newReq=new RequestModel({
            parentEmail,childEmail
        })
        newReq=await newReq.save();
        return res.status(201).json({
            message:"Request sent!",
            request:newReq
        })
    }
    catch(error){
        next(error);
    }
})

exp.getAllCourses=RouterAsyncErrorHandler(async(req,res,next)=>{

})

exp.addVideoFeedback=RouterAsyncErrorHandler(async(req,res,next)=>{

})

exp.addSuggestion=RouterAsyncErrorHandler(async(req,res,next)=>{
    
})
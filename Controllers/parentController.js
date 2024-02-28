const { RouterAsyncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const User =require("../Models/User");
const exp = module.exports;

exp.sendParentRequest=RouterAsyncErrorHandler(async(req,res,next)=>{
    const {childEmail}=req.body;
    try{
        const child=await User.findOne(childEmail);
        if(!child){
            throw new NotFou
        }
    }
    catch(error){
        next(error);
    }
})
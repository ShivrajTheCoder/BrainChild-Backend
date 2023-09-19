const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Teacher=require("./TeacherModel");
const video=new Schema({
    url:{
        type:String,
        required:true,
        unique:true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
        minLenght:10,
    },
    author:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:"Teacher"
    },
    approved:{
        type:Boolean,
        default:false,
    }
})

module.exports=mongoose.model("Video",video)
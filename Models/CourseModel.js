const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Video=require("./VideoModel");
const Teacher=require("./TeacherModel");
const courseModel=new Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
        minLength:10,
    },
    videos:[{
        type:mongoose.Types.ObjectId,
        ref:"Video"
    }],
    author:{
        type:mongoose.Types.ObjectId,
        ref:"Teacher",
    },
    enrolled:{
        type:Number,
        default:0
    },
    approved:{
        type:Boolean,
        default:false,
    }
})

module.exports=mongoose.model("Course",courseModel);
const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Video=require("./VideoModel");
const teacherSchema=new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    videos:{
        type:mongoose.Types.ObjectId,
        ref:"Video"
    }
})

module.exports=mongoose.model("Teacher",teacherSchema);
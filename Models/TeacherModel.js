const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Video=require("./VideoModel");
const teacherSchema=new Schema({
    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    videos:{
        type:mongoose.Types.ObjectId,
        ref:"Video"
    }
})

module.exports=mongoose.model("Teacher",teacherSchema);
const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Video=require("./VideoModel");
const teacherSchema=new Schema({
    username: {
        type: String,
        required: true,
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
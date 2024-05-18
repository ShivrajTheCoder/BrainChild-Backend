const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const enrollmentScema=new Schema({
    courseId:{
        type:mongoose.Types.ObjectId,
        ref:"Course"
    },
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User",
    },
    parentId:{
        type: mongoose.Types.ObjectId,
        ref:"Parent"
    }
})

module.exports=mongoose.model("EnrollReq",enrollmentScema);
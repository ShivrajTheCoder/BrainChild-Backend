const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const testTakenSchema=new Schema({
    test:{
        type:mongoose.Types.ObjectId,
        ref:"Test",
    },
    maximumMarks:{
        type:Number,
        required:true
    },
    scored:{
        type:Number,
        required:true
    },
    course:{
        type:mongoose.Types.ObjectId,
        ref:"Course",
    }
})

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLenght: 5
    },
    courses: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Course"
        }
    ],
    watchedVideos: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Video"
        }
    ],
    parent: {
        type: mongoose.Types.ObjectId,
        ref: "Parent"
    },
    tests:[testTakenSchema]
})


module.exports = mongoose.model("User", userSchema);
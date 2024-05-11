const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Teacher = require("./TeacherModel");
const video = new Schema({
    videourl: {
        type: String,
        required: true,
        unique: true,
    },
    thumbnail: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
        minLenght: 10,
    },
    author: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Teacher"
    },
    approved: {
        type: Boolean,
        default: false,
    },
    course: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Course",
    },
    likes: {
        type: Number,
        default: 0,
    }
})

module.exports = mongoose.model("Video", video)
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const responseSchema = new Schema({
    question: {
        type: mongoose.Types.ObjectId,
        ref: "Question"
    },
    option: {
        type: Number,
        required: true,
    },
});

const resultSchema = new Schema({
    topic_name: {
        type: String,
        required: true
    },
    result: {
        type: String,
        required: true
    }
});

const testResponseSchema = new Schema({
    testId: {
        type: mongoose.Types.ObjectId,
        ref: "Test",
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    responses: [responseSchema],
    totalMarks: {
        type: Number,
        default: 0
    },
    scored:{
        type:Number,
        default:0,
    },
    topicResults: [resultSchema]
});

module.exports = mongoose.model("TestResponse", testResponseSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const testSchema = new Schema({
    testName: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    questions: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Question",
            required: true
        }
    ],
    maximumMarks: {
        type: Number
    },
    topper: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    course: {
        type: mongoose.Types.ObjectId,
        ref: "Course",
        required: true
    },
    topics: {
        type: [String], // array of strings for topics
        required: true,
        validate: {
            validator: function (v) {
                return v.length <= 5;
            },
            message: props => `The topics array exceeds the maximum limit of 5.`
        }
    }
});

module.exports = mongoose.model("Test", testSchema);

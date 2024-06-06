const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const suggestionSchema = new Schema({
    description: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Teacher"
    }
});

module.exports = mongoose.model("Suggestion", suggestionSchema);
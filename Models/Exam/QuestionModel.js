const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const choiceOptionSchema=new Schema(
    {
        choice:{
            type:String,
            required:true
        }
    }
)
const questionSchema=new Schema({
    marks:{
        type:Number,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    options:[choiceOptionSchema],
    correct:choiceOptionSchema,
})


module.exports=mongoose.model("Question",questionSchema);
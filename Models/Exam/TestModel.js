const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const testSchema=new Schema({
    questions:[
        {
            type:mongoose.Types.ObjectId,
            ref:"Questions"
        }
    ],
    maximumMarks:{
        type:Number,
    },
    topper:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    course:{
        type:mongoose.Types.ObjectId,
        ref:"Course"
    }
})


module.exports=mongoose.model("Test",testSchema);
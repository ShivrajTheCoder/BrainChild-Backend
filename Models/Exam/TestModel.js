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
    }
})


module.exports=mongoose.model("Test",testSchema);
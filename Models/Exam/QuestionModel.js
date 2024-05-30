const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const questionSchema=new Schema({
    marks:{
        type:Number,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    correct:{
        type:String,
        required:true
    },
    topic:{
        type:String,
        required:true,
    },
    options:[
        {
            type:String,
        }
    ]
})


module.exports=mongoose.model("Question",questionSchema);
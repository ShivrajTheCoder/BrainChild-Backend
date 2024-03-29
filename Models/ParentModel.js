const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const parentSchema=new Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minLenght:5
    },
    child:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    }
})


module.exports=mongoose.model("Parent",parentSchema);
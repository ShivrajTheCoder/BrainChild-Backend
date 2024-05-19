const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const orderSchema=new Schema({
    course:{
        type:mongoose.Types.ObjectId,
        ref:"Course",
        required:true,
    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true,
    },
    amount:{
        type:Number,
        required:true,
        default:500
    },
    date: {
        type: Date,
        default: Date.now,
    },
    rzId:{
        type:String,
    },
    paymentStatus:{
        type:Boolean,
        default:false,
    }
})

module.exports=mongoose.model("Orders",orderSchema);
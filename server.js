const express=require("express");
const app=express();
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require("mongoose");
const DB_URL = process.env.DB_URL;
const PORT=process.env.PORT;
// console.log(DB_URL);
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(DB_URL)
  .then(()=>{
    console.log("Connected to database");
  });
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
// import routes
const authRoutes=require("./Routes/authRoutes");
const teacherRoutes=require("./Routes/teacherRoutes");
const courseRoutes=require("./Routes/courseRoutes");
const adminRoutes=require("./Routes/adminRoutes");
const { ErrorHandlerMiddleware } = require("./Middlewares/ErrorHandlerMiddleware");
// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// Middlewares
app.use(cors());

// Routes
app.use("/auth",jsonParser,authRoutes);
app.use("/teacher",jsonParser,teacherRoutes)
app.use("/courses",jsonParser,courseRoutes)
app.use("/admin",jsonParser,adminRoutes)
app.use(ErrorHandlerMiddleware)
app.listen(PORT,()=>{
    console.log("listening on port "+PORT);
})
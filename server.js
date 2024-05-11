const express = require("express");
const app = express();
const path = require('path');
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const { ErrorHandlerMiddleware } = require("./Middlewares/ErrorHandlerMiddleware");
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require("mongoose");
const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT;
// console.log(DB_URL);
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(DB_URL)
    .then(() => {
      console.log("Connected to database");
    });
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
const baseUploadsPath = path.join(__dirname, 'uploads');
// import routes
const teacherRoutes = require("./Routes/teacherRoutes");
const courseRoutes = require("./Routes/courseRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const userRotues=require("./Routes/userRoutes");
const parentRoutes=require("./Routes/parentRoutes")
// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// Middlewares
app.use(cors());

// Routes
app.use('/media', express.static(baseUploadsPath));
app.use("/teacher", jsonParser, teacherRoutes)
app.use("/courses", jsonParser, courseRoutes)
app.use("/admin", jsonParser, adminRoutes)
app.use("/user", jsonParser,userRotues);
app.use("/parent", jsonParser,parentRoutes);



app.use(ErrorHandlerMiddleware)
app.listen(PORT, () => {
  console.log("listening on port " + PORT);
})
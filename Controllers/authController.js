const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { NotFoundError, AuthenticationError, DuplicateDataError } = require("../Utilities/CustomErrors.js");
const { RouterAsyncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware.js");
const User = require("../Models/User.js");
const AdminModel = require("../Models/AdminModel.js");
const TeacherModel = require("../Models/TeacherModel.js");
const ParentModel = require("../Models/ParentModel.js");
const exp = module.exports;

async function authenticateUser(UserModel, req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new NotFoundError("User not found!")
    }

    // Compare the hashed input password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new AuthenticationError("Email or password doesn't match");
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id,
      },
      process.env.JWT_USER_KEY,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      message: "Signed In",
      token,
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
}
async function signupUser(UserModel, req, res, next) {
  try {
    const { username, email, password } = req.body;
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      throw new DuplicateDataError("User Already Exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new UserModel({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    return res.status(201).json({
      message: "User created",
    });
  } catch (error) {
    next(error);
  }
}
// Login handler for different types of users
exp.LoginUser = RouterAsyncErrorHandler(async (req, res, next) => {
  await authenticateUser(User, req, res, next);
});

exp.LoginAdmin = RouterAsyncErrorHandler(async (req, res, next) => {
  await authenticateUser(AdminModel, req, res, next);
});

exp.LoginTeacher = RouterAsyncErrorHandler(async (req, res, next) => {
  await authenticateUser(TeacherModel, req, res, next);
});

exp.LoginParent = RouterAsyncErrorHandler(async (req, res, next) => {
  await authenticateUser(ParentModel, req, res, next);
});

// Signup handler for different types of users
exp.SignupUser = RouterAsyncErrorHandler(async (req, res, next) => {
  await signupUser(User, req, res, next);
});

exp.SignupAdmin = RouterAsyncErrorHandler(async (req, res, next) => {
  await signupUser(AdminModel, req, res, next);
});

exp.SignupTeacher = RouterAsyncErrorHandler(async (req, res, next) => {
  await signupUser(TeacherModel, req, res, next);
});

exp.SignupParent = RouterAsyncErrorHandler(async (req, res, next) => {
  await signupUser(ParentModel, req, res, next);
});



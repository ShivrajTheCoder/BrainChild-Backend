const User = require("../Models/User.js");
const bcrypt = require("bcrypt");
const jwt=require("jsonwebtoken");
const { NotFoundError, AuthenticationError, DuplicateDataError } = require("../Utilities/CustomErrors.js");
const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware.js");

const exp = module.exports;

exp.Login = RouterAsncErrorHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new NotFoundError( "User not found!")
    }

    // Compare the hashed input password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new AuthenticationError("email or password doesn't match");
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
});


exp.Signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
    throw new DuplicateDataError("User Already Exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
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
};

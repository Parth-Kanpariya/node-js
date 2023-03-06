const User = require("../model/userModel");
const catchAsync = require("../util/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../util/appError");

const signToken = (payload_id) => {
  return jwt.sign({ id: payload_id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN,
  });
};

exports.signup = catchAsync(async (req, resp, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id)
  
  resp.status(200).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, resp, next) => {
  const { email, password } = req.body;

  //1). check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  //2).check if user exist && password is correct
  const user = await User.findOne({ email }).select("+password");
  const correct =await user.correctPassword(password, user.password);

  if (!user || !correct) {
    return next(new AppError("Incorrect email or password", 401));
  }

  //3). check if everything is ok, send token to the client
  const token = signToken(user._id);
  resp.status(200).json({
    status: "success",
    token,
  });
});

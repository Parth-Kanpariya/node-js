import User from "../model/User.js";
import catchAsync from "../util/catchAsync.js";
import path from "path";
import AppError from "../util/appError.js";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import validation from '../middleware/authMiddleware.js';
const __dirname = path.resolve();

const signToken = (payload_id) => {
  return jwt.sign({ id: payload_id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRETION,
  });
};

const createSendToken = (user, statusCode, resp) => {
  const token = signToken(user._id);
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    cookieOption.secure = true;
  }
  resp.cookie("jwt", token, cookieOption);
  //remove password from output
  user.password = undefined;
  console.log(token);

  // resp.status(statusCode).json({
  //   status: "success",
  //   token,
  //   data: {
  //     user,
  //   },
  // });

  resp.render(__dirname + "/view/greetings.ejs", {
    user: user,
  });
};

//rendering refistration page
const registration = catchAsync(async (req, resp, next) => {
  resp.sendFile(path.join(__dirname, "/public/registration.html"));
});

//rendering refistration page
const getLogin = catchAsync(async (req, resp, next) => {
  resp.sendFile(path.join(__dirname, "/public/login.html"));
});

const signup = catchAsync(async (req, resp, next) => {
  console.log(req.body);
  if (req.body.password !== req.body.passwordConfirm) {
    return resp.status(401).json({
      status:'fail',
      messsage:"Password don't match"
    })
  }
  const newUser = await User.create(req.body);
  console.log(newUser);

  return resp.redirect(301, "/get_login");

  //createSendToken(newUser, 201, resp);
});

const login = catchAsync(async (req, resp, next) => {
  const { email, password } = req.body;

  //1). check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  //2).check if user exist && password is correct
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new AppError("Incorrect email or password", 401));
  }
  const correct = await user.correctPassword(password, user.password);

  if (!user || !correct) {
    return next(new AppError("Incorrect email or password", 401));
  }

  //3). check if everything is ok, send token to the client
  createSendToken(user, 200, resp);
});

const protect = catchAsync(async (req, resp, next) => {
  //1) Getting token and check if it's  there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[2];
  }
  console.log(token);
  //console.log(token);
  if (!token) {
    return resp.redirect(301, "/get_login");
    // return next(
    //   new AppError("You are not logged in! Please log in to get access", 401)
    // );
  }

  //2) verification token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) check if user still exist

  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist!",
        401
      )
    );
  }

  //GRANT ACCESS to Protected Route
  req.user = freshUser;

  next();
});

export default {
  registration,
  signup,
  getLogin,
  login,
  protect,
};

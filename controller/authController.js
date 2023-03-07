const User = require("../model/userModel");
const catchAsync = require("../util/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../util/appError");
const sendEmail = require("../util/email");
const crypto = require("crypto");

const { promisify } = require("util");
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
  if(process.env.NODE_ENV==='production'){
    cookieOption.secure = true
  }
  resp.cookie("jwt", token, cookieOption);
  //remove password from output
  user.password = undefined;

  resp.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};


exports.signup = catchAsync(async (req, resp, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, resp);
});

exports.login = catchAsync(async (req, resp, next) => {
  const { email, password } = req.body;

  //1). check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  //2).check if user exist && password is correct
  const user = await User.findOne({ email }).select("+password");
  const correct = await user.correctPassword(password, user.password);

  if (!user || !correct) {
    return next(new AppError("Incorrect email or password", 401));
  }

  //3). check if everything is ok, send token to the client
  createSendToken(user, 200, resp);
});

exports.protect = catchAsync(async (req, resp, next) => {
  //1) Getting token and check if it's  there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log(token);
  //console.log(token);
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access", 401)
    );
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
  //4)check if user changed password after token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "User has changed password recently! Please log in again",
        401
      )
    );
  }

  //GRANT ACCESS to Protected Route
  req.user = freshUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, resp, next) => {
    //roles=> ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, resp, next) => {
  //1) get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address", 404));
  }
  //2) generate token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3) send it back to the user
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a ATCH request with your new password and passwordConfirm to ${resetURL}\n
  you didn't forget your password..Please ignor this email`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset Token (valid for 10 min)",
      message,
    });

    return resp.status(200).json({
      success: true,
      message: "Token sent to email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was error sending the email. Try again later!", 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, resp, next) => {
  //1). Get the user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2). if token was not expired and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3)update changepassword property for user
  //4) log the user in , send jwt
  createSendToken(user, 200, resp);
});

exports.updatePassword = catchAsync(async (req, resp, next) => {
  //1) get user from the collection
  const user = await User.findById(req.user.id).select("+password");
  //2)check if POSTed password is current

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong. ", 401));
  }
  //3)if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //User.findByIdAndUpdate will not work as intended!

  //4)log user in, send jwt
  createSendToken(user, 200, resp);
});

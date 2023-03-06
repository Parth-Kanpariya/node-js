const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide valid email"],
    },

    photo: String,
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please provide confirm password"],
      validate: {
        //This only works on create and save!!
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not same",
      },
    },
  },
  { collection: "User" }
);

userSchema.pre("save", async function (next) {
  //only run this function if password was actually modified
  if (!this.isModified("password")) {
    return next();
  }
  //hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //delete the passwordconfirm field
  this.passwordConfirm = undefined;
  next();
});

//this method available in all user object
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;

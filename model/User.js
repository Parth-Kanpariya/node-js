import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import AppError from '../util/appError.js';


const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Username is a required field"],
        unique:true,
        index: { unique: true },
        minlength: [6, "Username must be 6 character long"],
        maxlength: [40, "Username must be less than 40 character long"],
        trim: true,

    },
    email: {
        type: String,
        required: [true, "email is a required field"],
        unique: true,
        trim: true,
        lowercase: true,
        index: { unique: true }
    },
    password: {
        type: String,
        required: [true, "password is a required field"],
        trim: true,
        select:false,
        minlength: [8, "Password must be 8 character long"]
    },

},
    { collection: 'User', timestamps: true }
)


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
  
  

const User = mongoose.model('User', userSchema)
export default User
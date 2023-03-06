const User = require('../model/userModel')
const AppError = require('../util/appError')
const catchAsync = require('../util/catchAsync')

exports.getAllUser = catchAsync(async(req, resp, next)=>{
    const users = await User.find()

    return resp.status(200).json({
        status:'success',
        results:users.length,
        data:{
            users
        }
    })
})
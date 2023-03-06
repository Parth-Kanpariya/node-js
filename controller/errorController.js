const AppError = require("../util/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err)=>{
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0]
  const message = `Duplicate field value: ${value}. Please use another value!`
  return new AppError(message, 400)
}
const handleValidationErrorDB = (err)=>{
  const errors = Object.values(err.errors).map(el => el.message)
  const message = `Invalid input data ${errors.join('. ')}`
  return new AppError(message, 400)
}
const sendErrorDev = (err, resp) => {
  resp.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, resp) => {
  //operational , trusted error: send message to client
  if (err.isOperational) {
    resp.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //programing or other unknown error: don't leak error details
    //1) log the error
    console.error("ERROR:---", err);

    //2) send generic message
    resp.status(500).json({
      status: "error",
      message: "Something went very wrong",
    });
  }
};

module.exports = (err, req, resp, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    // console.log("development");
    // let error = {...err}
    // if(error.name === "CastError") error = handleCastErrorDB(error)
    sendErrorDev(err, resp);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    if (err.name === "CastError") error = handleCastErrorDB(err);
    if(err.code === 11000) error = handleDuplicateFieldsDB(err) 
    if(err.name === 'ValidationError') error = handleValidationErrorDB(err)
    sendErrorProd(error, resp);
  }
};

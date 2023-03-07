const express = require("express");
const app = express();
const AppError = require("./util/appError");
const globalErrorHandle = require("./controller/errorController");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

//1) Global middleware
//security http headers
app.use(helmet());

//development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
//limit request from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
});
app.use("/", limiter);

//body parser, reading data from body  into req,.body
app.use(express.json({ limit: "10kb" }));

//Data sanitization against NOSQL query injection
app.use(mongoSanitize());
//Data sanitization against XSS
app.use(xss());

//serving static files
app.use(express.static(`${__dirname}/public`));

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

//Test middleware
app.use((req, resp, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

//routes
app.use(require("./routes/tourRoute"));
app.use(require("./routes/userRoutes"));

//always put below code under below the route middleware
//below code handles the all unhandled routes
app.all("*", (req, resp, next) => {
  //1st approach
  // resp.status(404).json({
  //     status: 'fail',
  //     message: `Can't find ${req.originalUrl} on this server`
  // })

  //2nd approach
  // const err = new Error(`Can't find ${req.originalUrl} on this server`)
  // err.status = 'fail'
  // err.statusCode = 404

  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

//global error handling middleware
app.use(globalErrorHandle);

module.exports = app;

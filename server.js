import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/authRoutes.js";
import productRoute from "./routes/productRoutes.js";
import categoryRoute from "./routes/categoryRoutes.js";
import AppError from "./util/appError.js";
import globalErrorHandle from "./controller/errorController.js";
import fileUpload from "express-fileupload";
import("./db/connection.js");

const app = express();
dotenv.config();
const env = process.env;
const PORT = env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "./view");
app.use(fileUpload());
app.use(authRouter);
app.use(productRoute);
app.use(categoryRoute);

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

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});

import mongoose from "mongoose";

//const DB = process.env.DATABSE_CLOUD.replace('<PASSWORD>', process.env.DATABSE_PASSWORD)
const DB = process.env.DATABSE_LOCAL;
mongoose.set("strictQuery", false);


  try {
    mongoose.connect(DB, {}).then((con) => {
      // console.log(con.connection)
      console.log("DB connection Successfully");
    });
  } catch (e) {
    console.log("Error occured while connecting with the database");
  }



require("dotenv").config();
require("./config/DBC");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
app.use(cors());
app.use(morgan("dev"));
const studentRouter = require("./router/studentRouter");
const teacherRouter = require("./router/teacherRouter");
const schoolRouter = require("./router/schoolRouter");
const attendanceRouter = require("./router/attendanceRouter");
require("dotenv").config();
const mongoose = require("mongoose");
const url = process.env.DATABASE_URL;

app.use(express.json());
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/teacher", teacherRouter);
app.use("/api/v1/school", schoolRouter);
app.use("/api/v1/attendance", attendanceRouter);
const port = process.env.port || 7095;

app.get("/", (req, res) => {
  res.send("Welcome to Edutrack");
});

mongoose
  .connect(url)
  .then(() => {
    console.log("MongooseDB connected");
    app.listen(port, () => {
      console.log("App listening on " + port);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

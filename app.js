const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const GridFsStorage = require("multer-gridfs-storage");
const multer = require("multer");

const indexRouter = require("./routes/index");
const userRouter = require("./routes/userRouter"); //Hiten put your files in userRouter
const uploadRouter = require("./routes/uploadRouter"); //Ankit put your files in uplaodRouter

//MongoDB and GridFS connection
var gfs;
const uri =
  "mongodb+srv://learn:learn@learning.nplhm.mongodb.net/bookSharing?retryWrites=true&w=majority";
mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
const con = mongoose.connection;
con.on("open", () => {
  gfs = Grid(con.db, mongoose.mongo);
  gfs.collection("uploads"); //The folder in booksharing where all the data will be stored
  console.log("Connected to Database");
});

//Storage
var storage = new GridFsStorage({
  url: uri,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = file.originalname; //+Date.now() + path.extname(file.originalname)
      const fileinfo = {
        filename: filename,
        bucketName: "uploads", //same as gfs.collection
      };
      resolve(fileinfo);
    });
  },
});

const upload = multer({ storage });

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//Routers
app.use("/", indexRouter);
//app.use("/users", userRouter);
app.use("/upload", uploadRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

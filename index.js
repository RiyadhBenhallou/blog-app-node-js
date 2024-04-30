const express = require("express");
require("dotenv").config();
const connectDB = require("./server/config/db");
const cookieParser = require("cookie-parser");

const methodOverride = require("method-override");
const MongoStore = require("connect-mongo");
const session = require("express-session");

const PORT = process.env.PORT || 3000;
const app = express();
//Connect database
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  }),
);

app.set("view engine", "ejs");

app.use("/", require("./server/routes/main"));
app.use("/", require("./server/routes/admin"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

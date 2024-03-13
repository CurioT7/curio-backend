const mongoose = require("mongoose");
require("dotenv").config();
const express = require("express");
const userRouter = require("./router/userRouter");
const userSocialsRouter = require("./router/userSocialsRouter");
const session = require("express-session");
const passport = require("passport");
require("./passport/passport")(passport);

const app = express();

// Connect to database
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    // Terminate the process if unable to connect to the database
    process.exit(1);
  }
}

connectToDatabase();

// Express session
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(express.json());

//define routes
app.use("/api", userRouter);
app.use("/api", userSocialsRouter);

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

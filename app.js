const mongoose = require("mongoose");
require("dotenv").config();
const express = require("express");
const userRouter = require("./router/userRouter");
const userSocialsRouter = require("./router/userSocialsRouter");
const { ensureAuth, ensureGuest } = require("./middlewares/auth");
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

    // Start the Express server only after successfully connecting to the database
    const PORT = process.env.PORT;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    // Terminate the process if unable to connect to the database
    process.exit(1);
  }
}

connectToDatabase();

app.use(passport.initialize());

app.get("/", (req, res) => {
  res.send("Hello World");
});

// test
app.get("/auth/protected", ensureAuth, (req, res) => {
  res.send("Protected route");
});

app.use(express.json());

//define routes
app.use("/api", userRouter);
app.use("/api", userSocialsRouter);

/**
 * Main application file for setting up the Express server and connecting to the database.
 * @module app
 * @requires express
 * @requires mongoose
 * @requires dotenv
 */

const mongoose = require("mongoose");
require("dotenv").config();
const express = require("express");
const userRouter = require("./router/userRouter");
const userSocialsRouter = require("./router/userSocialsRouter");
const session = require("express-session");
const indentityRouter = require("./router/settings/identityRouter");
const subredditRouter = require("./router/subredditRouter");
const friendsRoute = require("./router/friendsRouter");
const reportRouter = require("./router/reportRouter");
const profileRouter = require("./router/profileRouter");
const listingRouter = require("./router/listingRouter");
const searchRouter = require("./router/searchRouter");
const categoryRouter = require("./router/categoryRouter");
const postRouter = require("./router/postRouter");
const notificationRouter = require("./router/notificationRouter");
const messageRouter = require("./router/messageRouter");
const chatRouter = require("./router/chatRouter");

const { app, server } = require("./utils/socket");

const cors = require("cors");

/**
 * Connects to the MongoDB database and starts the Express server.
 * @async
 */
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

app.use(cors());

// Express session
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(express.json());

//define routes

app.use("/api/settings", indentityRouter);
app.use("/api", userRouter);
app.use("/api", userSocialsRouter);

app.use("/api", subredditRouter);
app.use("/api", friendsRoute);

app.use("/api", reportRouter);
app.use("/api", listingRouter);
app.use("/api", categoryRouter);
app.use("/api/user", profileRouter);

app.use("/api", searchRouter);
app.use("/api", postRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api", messageRouter);

app.use("/api", chatRouter);

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket is running on port ${server.address().port}`);
});

// Seeding the database if needed
if (process.env.SEED_DB === "true" && process.argv.includes("--seed")) {
  require("./utils/seeding");
}

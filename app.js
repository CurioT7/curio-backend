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
const indentityRouter = require("./router/settings/identityRouter")

const app = express();

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

        // Start the Express server only after successfully connecting to the database
        const PORT = 3000;
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

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use(express.json());


app.use("/api/settings", indentityRouter);
app.use("/api", userRouter);

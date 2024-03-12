const mongoose = require("mongoose");
require("dotenv").config();
const express = require("express");
const userRouter = require("./router/userRouter");
const indentityRouter = require("./router/settings/identityRouter")

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
app.use("/api", userRouter);


app.use("/api/settings", indentityRouter);
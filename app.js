const mongoose = require("mongoose");
require("dotenv").config();
const express = require("express");




const app = express();
//connect to database
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("Connected to the database");
    })
    .catch((error) => {
        console.error("Error connecting to the database:", error);
    });


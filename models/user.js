/**
 * Defines the schema for a Reddit user.
 * @module User
 * @requires mongoose
 * @requires jwt
 * @requires ../utils/passwords
 */

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { hashPassword } = require("../utils/passwords");

/**
 * Schema definition for a Reddit user.
 * @typedef {Object} UserSchema
 * @property {string} username - The username of the user.
 * @property {string} email - The email address of the user.
 * @property {string} password - The hashed password of the user.
 * @property {Date} createdAt - The date and time when the user account was created.
 * @property {string} gender - The gender of the user.
 * @property {string} language - The preferred language of the user.
 */

/**
 * Schema definition for a Reddit user.
 * @type {UserSchema}
 */

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    gender:
    {
        type: String,
        required: false
    },
    language:
    {
        type: String,
        required: false
    }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const hashedPassword = await hashPassword(this.password);
        this.password = hashedPassword;
        next();
    }
    catch (error) {
        next(error);
    }
});


const User = mongoose.model("User", userSchema);

module.exports = User;
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../../models/user");
const brypt = require("bcrypt");
require("dotenv").config();

const { generateToken} = require("../../utils/tokens");
const  { hashPassword, comparePassword } = require("../../utils/passwords");

async function signUp(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { username, email, password } = req.body;
    //check if user already exists
    const userExist = await User.findOne({ username });
    if (userExist) {
        return res.status(409).json({ 
            success :false,
            message: "Username already exists" });
    }
    try{
        const user = new User({ username, email, password });
        //save user to database
        await user.save();
        //status
        return res.status(201).json({ 
            success: true,
            message: "User created successfully" });
    }
    catch (error) {
        return res.status(500).json({ 
            success: false,
            message: error.message });
    }
};

async function login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    //check if user exists
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(404).json({ 
            success: false,
            message: "User not found" });
    }
    //compare password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ 
            success: false,
            message: "Invalid credentials" });
    }
    //generate token
    const token = await generateToken(user._id);
    return res.status(200).json({ 
        success: true,
        message: "Login successful",
        token });

}
 

    
module.exports = { signUp, login };
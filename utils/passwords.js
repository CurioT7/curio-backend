const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

export async function hashPassword(password) {
    try{
        if (!password) {
            throw new Error("Password is required");
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    }
    catch (error) {
        throw new Error(error);
    }
  



}

module.exports = { hashPassword };
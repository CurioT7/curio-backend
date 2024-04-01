var nodemailer = require("nodemailer");
require("dotenv").config();
const User = require("../models/userModel");

//Function to send mail

/*
@params: mailOptions - object containing mail options
*/

async function sendMail(mailOptions) {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });
    let info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new Error(error);
  }
}

//Function to reset password
/**
  @params: email - email of the user
  @params: token - token to reset password
*/

async function resetPasswordMail(email, token) {
  //check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return {
      success: false,
    };
  }
  let mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Password Reset",
    html: `<h1>Password Reset</h1> 
        <p> Password reset link for your account</p>
        <br>
        <p>Click <a href="http://localhost:3000/reset-password/${token}">here</a> to reset your password</p>`,
  };
  await sendMail(mailOptions);
}

//Function to get username
/*
@params: email - email of the user
*/

async function getUsername(email) {
  //check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return {
      success: false,
    };
  }
  let mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Username Recovery",
    html: `<h1>Username Recovery</h1> 
          <p> Your username is ${user.username}</p>`,
  };
  await sendMail(mailOptions);
}

//send verification email
/**
  @params: email - email of the user
  @params: token - token to verify email
*/
async function sendVerificationMail(email, token) {
  let mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Email Verification",
    html: `<h1>Email Verification</h1> 
        <p> Click <a href="http://localhost:3000/verify_email/${token}">here</a> to verify your email</p>`,
  };
  await sendMail(mailOptions);
}

module.exports = {
  resetPasswordMail,
  getUsername,
  sendVerificationMail,
  sendMail,
};

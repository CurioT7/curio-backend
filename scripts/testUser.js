const { sign } = require("jsonwebtoken");
const User = require("../models/userModel");
const { generateTestToken } = require("../utils/tokens");

//test username = testUser
//test password =test1234

//generate unlimited token

//generate the token
const testUser = {
  username: "testUser1",
  email: "htarek1011@gmail.com",
  password: "test1234",
  accessToken:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjA3MzcyOWVmMDU2NzgwZmRjODc3YmUiLCJpYXQiOjE3MTE3NDg5MDcsImV4cCI6MTcxOTUyNDkwN30.SChjkHWwY5xF-7lS714iZS3P9mnh71QiFHA9XWZ018A",
};

//test token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjA3MzcyOWVmMDU2NzgwZmRjODc3YmUiLCJpYXQiOjE3MTE3NDg5MDcsImV4cCI6MTcxOTUyNDkwN30.SChjkHWwY5xF-7lS714iZS3P9mnh71QiFHA9XWZ018A

async function signUpTestUser() {
  const user = new User(testUser);
  await user.save();
  const token = await generateTestToken(testUser);
  return token;
}

module.exports = testUser;

// signUpTestUser().then((token) => {
//   console.log(token);
// });

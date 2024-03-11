const express = require("express");
const passport = require("passport");


const router = express.Router();

router.get("/google", passport.authenticate("google"), (req, res) => {
  res.status(200).json({ message: "Redirecting to google" });
});

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.status(200).json({ message: "Redirecting to google callback" });
  }
);

module.exports = router;

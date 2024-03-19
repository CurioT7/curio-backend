const express = require("express");
const passport = require("passport");
const webSocialsController = require("../controller/Auth/SocialsController");
const router = express.Router();

// Google Auth web

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
  () => {
    res.send({ title: "User logging in" });
  }
);

// Google Auth web callback, redirected to after google login
router.get(
  "/auth/google/callback",
  passport.authenticate(
    "google",
    //if failed redirect to Login again)
    { failureRedirect: "/api/auth/google" }
  ),
  webSocialsController.googleCallbackHandler
);

module.exports = router;

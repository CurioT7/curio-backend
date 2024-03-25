const express = require("express");
const passport = require("passport");
const webSocialsController = require("../controller/Auth/SocialsController");
const router = express.Router();

// Google Auth web

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google Auth web callback, redirected to after google login
router.get(
  "/auth/google/callback",
  passport.authenticate(
    "google",
    //if failed redirect to Login again)
    { failureRedirect: "/login" }
  ),
  webSocialsController.googleCallbackHandler
);

router.get(
  "/google/connect",
  passport.authenticate("google-connect", { scope: ["profile", "email"] })
);

router.get(
  "/google/connect/callback",
  passport.authenticate("google-connect"),
  webSocialsController.googleConnectCallbackHandler
);

//Firebase token authentication
router.post("/auth/google/mobile", webSocialsController.verifyGoogleToken);

module.exports = router;

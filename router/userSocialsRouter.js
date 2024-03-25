const express = require("express");
const passport = require("passport");
const webSocialsController = require("../controller/Auth/SocialsController");
const router = express.Router();

// Google Auth web

router.post("/auth/google", webSocialsController.googleAuth);

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

router.post("/google/connect", webSocialsController.connectWithGoogle);

router.get(
  "/google/connect/callback",
  passport.authenticate("google-connect"),
  webSocialsController.googleConnectCallbackHandler
);

module.exports = router;

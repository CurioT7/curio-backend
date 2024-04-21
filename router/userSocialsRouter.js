const express = require("express");
const webSocialsController = require("../controller/Auth/SocialsController");
const router = express.Router();

// Google Auth web

router.post("/auth/google", webSocialsController.googleAuth);

router.post("/google/connect", webSocialsController.connectWithGoogle);

router.post("/google/disconnect", webSocialsController.disconnectGoogle);


module.exports = router;

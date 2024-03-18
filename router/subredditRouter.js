const express = require("express");
const router = express.Router();

const subredditsController = require("../controller/friends/subredditsController");

router.post("/createSubreddit", subredditsController.createSub);

module.exports = router;

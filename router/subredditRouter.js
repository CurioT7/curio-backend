const express = require("express");
const router = express.Router();
const subredditsController = require("../controller/friends/subredditsController");

/**
 * Route to create a new subreddit.
 * @name POST /subreddit/createSubreddit
 * @function
 * @memberof module:routes/subreddit
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post("/createSubreddit", subredditsController.newSubreddit);

module.exports = router;

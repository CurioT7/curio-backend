const express = require("express");
const router = express.Router();
const subredditsController = require("../controller/friends/subredditsController");
const modToolsController = require("../controller/community/modToolsController");
const { authenticate } = require("../middlewares/auth");
const { multer, upload, storage } = require("../utils/s3-bucket");
/**
 * Route to create a new subreddit.
 * @name POST /subreddit/createSubreddit
 * @function
 * @memberof module:routes/subreddit
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post(
  "/createSubreddit",
  authenticate,
  subredditsController.newSubreddit
);

/**
 * Route to get a subreddit info from a subreddit.
 * @name GET /subreddit/r/:subreddit
 * @function
 * @memberof module:routes/subreddit
 * @param {string} path - Express path
 *  @param {callback} middleware - Express middleware.
 */
router.get("/r/:subreddit", subredditsController.getSubredditInfo);

/**
 * Route to retrieve the top communities sorted by the number of members.
 * @name GET /best/communities
 * @function
 * @memberof subredditsController
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 * @returns {Promise<void>} - Promise that resolves once the operation is complete.
 */
router.get("/best/communities", subredditsController.getTopCommunities);

router.post(
  "/moderationInvite/:subreddit",
  authenticate,
  subredditsController.createModeration
);
router.patch(
  "/removemoderator/:subreddit",
  authenticate,
  subredditsController.removeModeration
);
router.post(
  "/acceptmoderation/:subreddit",
  authenticate,
  subredditsController.acceptInvitation
);

router.patch(
  "/bannerAndAvatar/:subreddit",
  authenticate,
  upload.single("media"),
  modToolsController.bannerAndAvatar
);

module.exports = router;

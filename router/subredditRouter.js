const express = require("express");
const router = express.Router();
const subredditsController = require("../controller/friends/subredditsController");
const { authenticate } = require("../middlewares/auth");    
const { auth } = require("google-auth-library");
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

/**
 * Route to Inivite a user to moderate a subreddit.
 * @name POST /subreddit/moderationInvite/:subreddit
 * @function
 * @memberof module:routes/subreddit
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
 
router.post(
  "/moderationInvite/:subreddit",
  authenticate, subredditsController.createModeration
);

/**
 * Route to remove a moderator from a subreddit.
 * @name PATCH /subreddit/removemoderator/:subreddit
 * @function
 * @memberof module:routes/subreddit
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.patch(
  "/removemoderator/:subreddit",
  authenticate,
  subredditsController.removeModeration
);

/**
 * Route to accept a moderation invitation.
 * @name POST /subreddit/acceptmoderation/:subreddit
 * @function
 * @memberof module:routes/subreddit
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post(
  "/acceptmoderation/:subreddit",
  authenticate,
  subredditsController.acceptInvitation
);
/**
 * Route to decline a moderation invitation.
 * @name POST /subreddit/declinemoderation/:subreddit
 * @function
 * @memberof module:routes/subreddit
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post("/declinemoderation/:subreddit", authenticate, subredditsController.declineInvitation);
/**
 * Route to get the moderators of a subreddit.
 * @name GET /subreddit/getModerators/:subreddit
 * @function
 * @memberof module:routes/subreddit
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get("/about/moderators/:subreddit", subredditsController.getModerators);

/**
 * Route to get the moderation queue of a subreddit.
 * @name GET /subreddit/getModerationQueue/:subreddit
 * @function
 * @memberof module:routes/subreddit
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
router.get(
  "/getModerationQueue/:subreddit/:type/:time?",authenticate,
  subredditsController.getModeratorsQueue
);

/**
 * Route to mute a user in a subreddit.
 * @name POST /subreddit/muteUser/:subreddit
 * @function
 * @memberof module:routes/subreddit
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
router.post("/muteUser/:subreddit", authenticate, subredditsController.muteUser);

/**
 * Route to unmute a user in a subreddit.
 * @name PATCH /subreddit/unmuteUser/:subreddit
 * @function
 * @memberof module:routes/subreddit
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
router.patch("/unmuteUser/:subreddit", authenticate, subredditsController.unMuteUser);

/**
 * Route to Leave a moderator from a subreddit.
 * @name PATCH /subreddit/leaveModerator/:subreddit
 * @function
 * @memberof module:routes/subreddit
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
router.patch("/leaveModerator/:subreddit", authenticate, subredditsController.leaveModerator);

/** 
 * Route to get the subreddits that the user moderates.
 * @name GET /mine/moderator
 * @function
 * @memberof module:routes/subreddit
 * @param {string} path - Express path
 */

router.get("/mine/moderator", authenticate, subredditsController.getMineModeration);

/**
 * Route to get the userMudted subreddits.
 * @name GET /about/muted
 * @function
 * @memberof module:routes/subreddit
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise that resolves once the operation is complete.
 */
router.get("about/muted/:subreddit", authenticate, subredditsController.getUserMuted);

module.exports = router;

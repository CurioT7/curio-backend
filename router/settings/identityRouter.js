const express = require("express");
const identityController = require("../../controller/identity/identityController");
const router = express.Router();

/**
 * Route to get current user information
 * @name GET /api/settings/v1/me
 * @function
 * @memberof module:routes/identity
 * @inner
 * @param {string} path - Express route path
 * @param {callback} middleware - Express middleware callback
 */
router.get("/v1/me", identityController.getMe);


/**
 * Route to get user preferences
 * @name GET /api/settings/v1/me/prefs/
 * @function
 * @memberof module:routes/identity
 * @inner
 * @param {string} path - Express route path
 * @param {callback} middleware - Express middleware callback
 */
router.get("/v1/me/prefs", identityController.getUserPreferences);


/**
 * Route to update user preferences
 * @name PATCH /api/settings/v1/me/prefs
 * @function
 * @memberof module:routes/identity
 * @inner
 * @param {string} path - Express route path
 * @param {callback} middleware - Express middleware callback
 */
router.patch("/v1/me/prefs", identityController.updateUserPreferences);


/**
 * Route to mute a community
 * @name POST /api/settings/mute
 * @function
 * @memberof module:routes/identity
 * @inner
 * @param {string} path - Express route path
 * @param {callback} middleware - Express middleware callback
 */
router.post("/mute", identityController.muteCommunity)

/**
 * 
 * Route to unmute a community
 * @name POST /api/settings/unmute
 * @function
 * @memberof module:routes/identity
 * @inner
 * @param {string} path - Express route path
 * @param {callback} middleware - Express middleware callback
 */
router.post("/unmute", identityController.unmuteCommunity)


/**
 * Route to delete a user account
 * @name DELETE /api/delete_account
 * @function
 * @memberof module:routes/identity
 * @inner
 * @param {string} path - Express route path
 * @param {callback} middleware - Express middleware callback
 */
router.delete("/delete_account", identityController.deleteAccount)




module.exports = router;
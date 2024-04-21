const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notification/notificationController");

/**
 * Get all notifications history for a user.
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves once all notifications history is fetched.
 */
router.get(
  "/history",
  notificationController.getAllNotificationsForUser
);

/**
 * Disable notifications for a user.
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves once notifications are disabled for the user.
 */
router.post(
  "/settings/disable",
  notificationController.disableNotificationsForUser
);

/**
 * Enable notifications for a user.
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves once notifications are enabled for the user.
 */
router.post(
  "/settings/enable",
  notificationController.enableNotificationsForUser
);

/**
 * Hide notifications for a user.
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} A promise that resolves once notifications are hidden for the user.
 */
router.post("/hide", notificationController.hideNotifications);

/**
 * Unhide notifications for a user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response containing the status of the operation.
 */
router.post("/unhide", notificationController.unhideNotifications);

/**
 * Retrieve unsent notifications for a user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response containing unsent notifications for the user.
 */
router.get("/unsent", notificationController.getUnsentNotificationsForUser);

/**
 * Mark a notification as read.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response containing the status of the operation.
 */
router.post("/read-notification", notificationController.readNotifications);

/**
 * Retrieves unread notifications for the authenticated user.
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 * @returns {void}
 */
router.get("/unread", notificationController.getUnreadNotifications);

/**
 * Retrieves read notifications for the authenticated user.
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 * @returns {void}
 */
router.get("/read", notificationController.getReadNotifications);

module.exports = router;
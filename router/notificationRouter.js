const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notification/notificationController");

router.get(
  "/notifications/history",
  notificationController.getAllNotificationsForUser
);
router.post(
  "/notifications/settings/disable",
  notificationController.disableNotificationsForUser
);
router.post(
  "/notifications/settings/enable",
  notificationController.enableNotificationsForUser
);
module.exports = router;
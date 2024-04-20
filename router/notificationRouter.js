const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notification/notificationController");

router.get(
  "/notifications/history",
  notificationController.getAllNotificationsForUser
);

module.exports = router;
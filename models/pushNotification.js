/**
 * Defines the schema for the Notification model in the database.
 * @module notificationModel
 * @requires mongoose
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Notification Schema definition.
 * @typedef {Object} Notification
 * @property {string} title - The title of the notification.
 * @property {string} message - The content of the notification message.
 * @property {Date} timestamp - The timestamp when the notification was created.
 * @property {string} recipient - The username of the recipient user.
 * @property {boolean} isRead - Indicates whether the notification has been read (default: false).
 * @property {boolean} isHidden - Indicates whether the notification is hidden (default: false).
 * @property {boolean} isSent - Indicates whether the notification has been sent (default: false).
 */
const pushNotificationSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  recipient: {
    type: String,
    ref: "User",
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  isSent: {
    type: Boolean,
    default: false,
    },
});

/**
 * Creates a model for the Comment schema.
 * @type {mongoose.Model}
 */
const pushNotification = mongoose.model(
  "pushNotification",
  pushNotificationSchema
);

module.exports = pushNotification;

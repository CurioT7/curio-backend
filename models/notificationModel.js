const mongoose = require("mongoose");
const Schema = mongoose.Schema;
/**
 * Schema definition for a notification.
 * @typedef {Object} NotificationSchema
 * @property {string} title - The title of the notification.
 * @property {string} message - The message of the notification.
 * @property {Date} timestamp - The date and time when the notification was created.
 * @property {mongoose.Types.ObjectId} recipient - The ID of the recipient of the notification.
 * @property {boolean} isRead - A flag indicating whether the notification has been read.
 */
const notificationSchema = new Schema({
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
  isEnable: {
    type: Boolean,
    default: true,
  },
});
/**
 * Creates a model for the Comment schema.
 * @type {mongoose.Model}
 */
const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;



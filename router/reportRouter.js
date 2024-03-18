/**
 * Express router for handling user reports.
 * @module routes/reportRouter
 */

const express = require("express");
const router = express.Router();
const reportController = require("../controller/profile/reportController");

/**
 * Route to handle POST requests for reporting a user.
 * @name POST/report_user
 * @function
 * @memberof module:routes/reportRouter
 * @param {string} path - The URL path for the route ("/report_user").
 * @param {function} middleware - The controller function to handle the POST request.
 * @returns {object} Express router instance.
 */
router.post("/report_user", reportController.reportUser);

module.exports = router;

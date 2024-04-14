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

/**
 * Route for reporting content.
 * @name POST /report
 * @function
 * @memberof router
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
router.post("/report", reportController.reportContent);

/**
 * Route for retrieving reported content from the specified subreddit.
 *
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @param {NextFunction} next - The Express NextFunction middleware.
 * @returns {void}
 */
router.get("/:subreddit/getReports", reportController.getReportedContent);

module.exports = router;

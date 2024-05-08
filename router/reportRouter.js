/**
 * Express router for handling user reports.
 * @module routes/reportRouter
 */

const express = require("express");
const router = express.Router();
const reportController = require("../controller/profile/reportController");
const { authenticate } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");

/**
 * Route to handle POST requests for reporting a user.
 * @name POST/report_user
 * @function
 * @memberof module:routes/reportRouter
 * @param {string} path - The URL path for the route ("/report_user").
 * @param {function} middleware - The controller function to handle the POST request.
 * @returns {object} Express router instance.
 */
router.post("/report_user", authenticate, reportController.reportUser);

/**
 * Route for reporting content.
 * @name POST /report
 * @function
 * @memberof router
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
router.post("/report", authenticate, reportController.reportContent);

/**
 * Route for retrieving reported content from the specified subreddit.
 *
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @param {NextFunction} next - The Express NextFunction middleware.
 * @returns {void}
 */
router.get(
  "/:subreddit/getReports",
  authenticate,
  reportController.getSubredditReportedContent
);

/**
 * Route for retrieving reports by admin.
 *
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @param {NextFunction} next - The Express NextFunction middleware.
 * @returns {void}
 */
router.get(
  "/admin/reports",
  authenticate,
  isAdmin,
  reportController.getAdminReports
);

/**
 * Route for retrieving reports viewed by admin.
 *
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @param {NextFunction} next - The Express NextFunction middleware.
 * @returns {void}
 */
router.get(
  "/admin/viewed-reports",
  authenticate,
  isAdmin,
  reportController.getAdminReportsHistory
);

/**
 * POST request to take action on a reported item by an admin.
 * @async
 * @function takeActionOnReportRoute
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves once the action is taken on the report.
 */
router.post(
  "/admin/action",
  authenticate,
  isAdmin,
  reportController.takeActionOnReport
);

module.exports = router;

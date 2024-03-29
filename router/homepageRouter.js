const express = require("express");
const router = express.Router();
const categoriesController = require("../controller/homepage/homepageController");

router.get("/random-category", categoriesController.getRandomCommunities);

module.exports = router;

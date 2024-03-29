const express = require("express");
const router = express.Router();
const categoriesController =
  require("../controller/homepage/homepageController").default;

router.get("/random-category", categoriesController.getRandomCommunities);

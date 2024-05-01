const express = require("express");
const router = express.Router();
const { compose } = require("../controller/message/privateMessageController");
const { authenticate } = require("../middlewares/auth");

router.post("/message/compose", authenticate, compose);

module.exports = router;

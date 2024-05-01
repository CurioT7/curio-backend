const express = require("express");
const router = express.Router();
const {
  compose,
  inbox,
} = require("../controller/message/privateMessageController");
const { authenticate } = require("../middlewares/auth");

router.post("/message/compose", authenticate, compose);

router.get("/message/inbox/:type", authenticate, inbox);

module.exports = router;

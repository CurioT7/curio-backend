const express = require("express");
const router = express.Router();
const {
  compose,
  inbox,
  getSent,
  readAll,
  deleteMessage,
  unreadMessage,
} = require("../controller/message/privateMessageController");
const { authenticate } = require("../middlewares/auth");

router.post("/message/compose", authenticate, compose);

router.get("/message/inbox/:type", authenticate, inbox);

router.get("/message/sent", authenticate, getSent);

router.post("/message/readAll", authenticate, readAll);

router.post("/message/unread/:id", authenticate, unreadMessage);

router.post("/message/delete/:id", authenticate, deleteMessage);

module.exports = router;

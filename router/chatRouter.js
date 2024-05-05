const express = require("express");
const router = express.Router();
const {
  createChat,
  getChatRequests,
  getChat,
  manageChatRequest,
  chatsOverview,
} = require("../controller/message/chatController");
const { authenticate } = require("../middlewares/auth");

router.post("/chat/create", authenticate, createChat);

router.get("/chat/requests", authenticate, getChatRequests);

router.get("/chat/:chatId", authenticate, getChat);

router.post("/chat/manage", authenticate, manageChatRequest);

router.get("/chat/overview/:filter", authenticate, chatsOverview);

module.exports = router;

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

const multer = require("multer");
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

router.post("/chat/create", authenticate, upload.single("media"), createChat);

router.get("/chat/requests", authenticate, getChatRequests);

router.get("/chat/:chatId", authenticate, getChat);

router.post("/chat/manage", authenticate, manageChatRequest);

router.get("/chat/overview/:filter", authenticate, chatsOverview);

module.exports = router;

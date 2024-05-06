const Chat = require("../../models/chatModel");
const User = require("../../models/userModel");
const { getFilesFromS3, sendFileToS3 } = require("../../utils/s3-bucket");

/**
 * Create a chat between two users
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - Response object
 * @async
 */

async function createChat(req, res) {
  try {
    const recipient = await User.findOne({ username: req.body.recipient });
    if (!recipient) {
      return res.status(400).json({
        success: false,
        message: "No user found with that username",
      });
    }
    //check if chat already exists
    const chatExists = await Chat.findOne({
      participants: [req.user.userId, recipient._id],
    });
    if (chatExists) {
      return res.status(400).json({
        success: false,
        message: "Chat already exists",
      });
    }
    let media;

    if (req.file) {
      media = await sendFileToS3(req.file);
    }
    const chat = new Chat({
      participants: [req.user.userId, recipient._id],
      messages: [
        {
          sender: req.user.userId,
          message: req.body.message && req.body.message,
          media: media && media,
        },
      ],
    });
    const user = await User.findById(req.user.userId);
    if (
      !user.followings.includes(recipient._id) ||
      !recipient.followers.includes(user._id)
    ) {
      recipient.pendingChatRequests.push({
        chat: chat._id,
      });
      chat.isPendingRequest = true;
    }
    await Promise.all([chat.save(), recipient.save()]);
    return res.status(201).json({
      success: true,
      message: "Chat created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Get chat requests for the user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - Response object
 * @async
 * @returns {Object} - Response object
 */
async function getChatRequests(req, res) {
  try {
    //get request message and username only
    const user = await User.findById(req.user.userId).populate({
      path: "pendingChatRequests.chat",
      select: "messages isPendingRequest",
      populate: {
        path: "messages",
        options: { sort: { timestamp: -1 } },
        select: "message",
        perDocumentLimit: 1,
        populate: {
          path: "sender",
          select: "username",
        },
      },
    });
    return res.status(200).json({
      success: true,
      chatRequests: user.pendingChatRequests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Get chat by chatId
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - Response object
 * @async
 * @returns {Object} - Response object
 */

async function getChat(req, res) {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate({
        path: "messages",
        options: { sort: { timestamp: 1 } },
        select: "message sender timestamp",
        populate: {
          path: "sender",
          select: "username",
        },
      })
      .populate({
        path: "participants",
        select: "username",
      });
    //get chat media
    let media;
    for (let i = 0; i < chat.messages.length; i++) {
      if (chat.messages[i].media) {
        media = await getFilesFromS3(chat.messages[i].media);
        chat.messages[i].media = media;
      }
    }
    return res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Manage chat request (accept or decline)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - Response object
 * @async
 * @returns {Object} - Response object
 */

async function manageChatRequest(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    const chat = await Chat.findById(req.body.chatId);
    if (!chat) {
      return res.status(400).json({
        success: false,
        message: "Chat not found",
      });
    }
    const recipient = await User.findById(chat.participants[1]);
    if (!chat.isPendingRequest) {
      return res.status(400).json({
        success: false,
        message: "This chat request is not pending",
      });
    }
    if (req.body.accept) {
      recipient.pendingChatRequests = recipient.pendingChatRequests.filter(
        (request) => request.chat.toString() !== chat._id.toString()
      );
      chat.isPendingRequest = false;
      await Promise.all([recipient.save(), chat.save()]);
      return res.status(200).json({
        success: true,
        message: "Chat request accepted",
      });
    } else {
      recipient.pendingChatRequests = recipient.pendingChatRequests.filter(
        (request) => request.chat.toString() !== chat._id.toString()
      );
      //ignore chat
      user.pendingChatRequests = user.pendingChatRequests.filter(
        (request) => request.chat.toString() !== chat._id.toString()
      );

      await Promise.all([recipient.save(), chat.save()]);
      return res.status(200).json({
        success: true,
        message: "Chat request declined",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Get chats overview based on filter (all, unread, pending, etc.)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - Response object
 * @async
 * @returns {Object} - Response object
 */

async function chatsOverview(req, res) {
  try {
    const filter = req.params.filter;
    const user = await User.findById(req.user.userId);
    let chats;
    switch (filter) {
      case "all":
        chats = await Chat.find({
          participants: user._id,
        })
          .populate({
            //other participants
            path: "participants",
            select: "username profilePicture",
            match: { _id: { $ne: req.user.userId } },
          })
          .populate({
            path: "messages",
            options: { sort: { timestamp: -1 } },
            select: "message sender timestamp",
            match: { isPendingRequest: { $ne: true } },
            perDocumentLimit: 1,
            populate: {
              path: "sender",
              select: "username",
            },
          });
        break;
      //TODO: add more filters
    }
    //get media
    if (chats.length > 0) {
      for (let i = 0; i < chats.length; i++) {
        const chat = chats[i];
        //get media for each participant
        for (let j = 0; j < chat.participants.length; j++) {
          const participant = chat.participants[j];
          if (participant.profilePicture) {
            const media = await getFilesFromS3(participant.profilePicture);
            participant.profilePicture = media;
          }
        }
      }
    }

    const requestNumber = user.pendingChatRequests.length;
    return res.status(200).json({
      success: true,
      chats,
      requestNumber,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function sendMessage(req, res) {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(400).json({
        success: false,
        message: "Chat not found",
      });
    }
    const media = req.file && (await sendFileToS3(req.file));
    chat.messages.push({
      sender: req.user.userId,
      message: req.body.message && req.body.message,
      media: media && media,
    });
    await chat.save();
    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createChat,
  getChatRequests,
  getChat,
  manageChatRequest,
  chatsOverview,
  sendMessage,
};

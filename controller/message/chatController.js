const { default: mongoose } = require("mongoose");
const Chat = require("../../models/chatModel");
const User = require("../../models/userModel");
const { getFilesFromS3, sendFileToS3 } = require("../../utils/s3-bucket");
const { getRecieverSocket } = require("../../utils/socket");

async function checkUsername(req, res) {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No user found with that username",
      });
    }

    if (user.profilePicture) {
      const icon = await getFilesFromS3(user.profilePicture);
      return res.status(200).json({
        success: true,
        username: user.username,
        profilePicture: icon,
      });
    }
    return res.status(200).json({
      success: true,
      username: user.username,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Create a chat between two users
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} - Response object
 * @async
 */

async function createChat(req, res) {
  try {
    //TODO add group chat
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

    // Emit WebSocket event to notify the recipient about the new chat
    const recipientSocket = getRecieverSocket(recipient._id);
    if (recipientSocket) {
      recipientSocket.emit("new-chat", { chatId: chat._id });
    }

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
    const chatId = new mongoose.Types.ObjectId(req.params.chatId);

    const chat = await Chat.aggregate([
      {
        $match: {
          _id: chatId,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participants",
        },
      },
      {
        $lookup: {
          //sender username
          from: "users",
          localField: "messages.sender",
          foreignField: "_id",
          as: "senders",
        },
      },
      {
        $project: {
          messages: 1,
          participants: {
            //participants username
            $map: {
              input: "$participants",
              as: "participant",
              in: {
                username: "$$participant.username",
              },
            },
          },
          senders: {
            $map: {
              input: "$senders",
              as: "sender",
              //username and id
              in: {
                username: "$$sender.username",
                id: "$$sender._id",
              },
            },
          },
        },
      },
      {
        //sort messages by timestamp
        $unwind: "$messages",
      },
      {
        $sort: { "messages.timestamp": -1 },
      },
      {
        $group: {
          _id: "$_id",
          messages: { $push: "$messages" },
          participants: { $first: "$participants" },
          senders: { $first: "$senders" },
        },
      },
    ]);

    //get media sent in chat
    let media;
    //length of chat messages
    const messagesLength = chat[0].messages.length;
    for (let i = 0; i < messagesLength; i++) {
      if (chat[0].messages[i].media) {
        media = await getFilesFromS3(chat[0].messages[i].media);
        chat[0].messages[i].media = media;
      }
    }

    let profilePicture;
    //get profile picture of each participant
    for (let i = 0; i < chat[0].participants.length; i++) {
      const user = await User.findOne({
        username: chat[0].participants[i].username,
      });
      if (user.profilePicture) {
        profilePicture = await getFilesFromS3(user.profilePicture);
        chat[0].participants[i].profilePicture = profilePicture;
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
        //get most recent message and participant name only for each chat using aggregate
        chats = await Chat.aggregate([
          {
            $match: {
              participants: { $in: [user._id] },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "participants",
              foreignField: "_id",
              as: "participants",
            },
          },
          {
            $unwind: "$participants",
          },
          {
            $match: {
              "participants._id": { $ne: user._id },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "messages.sender",
              foreignField: "_id",
              as: "sender",
            },
          },
          {
            $unwind: "$sender",
          },
          {
            $project: {
              messages: { $slice: ["$messages", -1] },
              participants: "$participants.username",
              unReadMessagesNumber: {
                $size: {
                  $filter: {
                    input: "$messages",
                    as: "message",
                    cond: {
                      $and: [
                        { $eq: ["$$message.sender", "$participants._id"] },
                        { $eq: ["$$message.isDelivered", true] },
                      ],
                    },
                  },
                },
              },
              // Participants media
              profilePicture: "$participants.profilePicture",
              // Sender name
              sender: "$sender.username",
            },
          },
          {
            $sort: { "messages.timestamp": -1 }, // Sort by the timestamp of the most recent message
          },
        ]);
        //get chat media
        let media;
        for (let i = 0; i < chats.length; i++) {
          if (chats[i].profilePicture) {
            media = await getFilesFromS3(chats[i].profilePicture);
            chats[i].profilePicture = media;
          }
        }

        break;

      //TODO: add more filters
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
      status: "sent",
    });
    await chat.save();

    // Emit WebSocket event to notify the recipient about the new message
    const recipient = chat.participants.find(
      (participant) => participant.toString() !== req.user.userId
    );
    const recipientSocket = getRecieverSocket(recipient);
    if (recipientSocket) {
      recipientSocket.emit("new-message", {
        chatId: chat._id,
        message: newMessage,
      });
      //change message to delivered
      chat.messages[chat.messages.length - 1].status = "delivered";
      await chat.save();
    }
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
  checkUsername,
};

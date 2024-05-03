const Message = require("../../models/messageModel");
const User = require("../../models/userModel");
const Subreddit = require("../../models/subredditModel");

async function compose(req, res) {
  try {
    const subject = req.body.subject;
    const message = req.body.message;
    let sender = await User.findById(req.user.userId);
    let senderSubreddit;
    if (req.body.subreddit) {
      senderSubreddit = await Subreddit.findOne({ name: req.body.subreddit });
      if (!senderSubreddit) {
        return res.status(400).json({
          success: false,
          message: "No subreddit found with that name",
        });
      }
      let user = await User.findById(req.user.userId);
      if (
        !senderSubreddit.moderators.some(
          (mod) => mod.username === user.username
        )
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not a moderator of this subreddit",
        });
      }
    }
    //TODO handle if sent from subreddit
    let recipient;
    if (!req.body.sendToSubreddit) {
      recipient = await User.findOne({ username: req.body.recipient });
      if (!recipient) {
        return res.status(400).json({
          success: false,
          message: "No user found with that username",
        });
      }
    }
    //recipient is subreddit
    let subreddit;
    if (req.body.sendToSubreddit) {
      subreddit = await Subreddit.findOne({ name: req.body.recipient });
      if (!subreddit) {
        return res.status(400).json({
          success: false,
          message: "No subreddit found with that name",
        });
      }
      //send to moderators
      recipient = subreddit.moderators;

      if (recipient.length > 1) {
        //TODO check if this works
        for (let i = 0; i < recipient.length; i++) {
          recipient[i] = await User.findOne({
            username: recipient[i].username,
          });
        }
        // remove duplicates
        recipient = recipient.filter(
          (v, i, a) => a.findIndex((t) => t.username === v.username) === i
        );
      } else {
        recipient = await User.findOne({
          username: subreddit.moderators[0].username,
        });
      }
    }

    const sentMessage = new Message({
      sender,
      type: "message",
      senderSubreddit: senderSubreddit && senderSubreddit,
      recipientSubreddit: subreddit && subreddit,
      recipient,
      subject,
      message,
      isPrivate: true,
      isSent: true,
    });

    sender.sentPrivateMessages.push(sentMessage);
    if (recipient.length > 1) {
      for (let i = 0; i < recipient.length; i++) {
        recipient[i].receivedPrivateMessages.push(sentMessage);
      }
    } else {
      recipient.receivedPrivateMessages.push(sentMessage);
    }

    await sentMessage.save();

    if (subreddit) {
      sentMessage.recipient = null;
      await Promise.all([subreddit.save(), sentMessage.save()]);
    }

    //save alll parallel
    await Promise.all([sender.save(), recipient.save()]);

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getMessages(messagesId) {
  try {
    // Fetch messages with sender and recipient populated
    const messages = await Message.find({ _id: { $in: messagesId } })
      .populate({ path: "sender", select: "username" })
      .populate({ path: "recipient", select: "username" })
      .populate({ path: "recipientSubreddit", select: "name" })
      .populate({ path: "senderSubreddit", select: "name" })
      .populate({ path: "linkedSubreddit", select: "name" })
      .sort({ timestamp: -1 });

    return messages;
  } catch (error) {
    console.error("Error while fetching messages:", error);
    throw error; // Rethrow the error for further handling
  }
}

async function inbox(req, res) {
  try {
    const type = req.params.type;
    const user = await User.findById(req.user.userId);
    let messages = [];
    switch (type) {
      case "all":
        messages = [...user.receivedPrivateMessages, ...user.mentions];
        break;
      case "unread":
        messages = user.receivedPrivateMessages.filter(
          (message) => !message.isRead
        );
        break;
      case "messages":
        messages = [
          ...user.receivedPrivateMessages,
          ...user.sentPrivateMessages,
        ];
        break;
      case "usernameMentions":
        messages = user.mentions;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid type",
        });
    }

    messages = await getMessages(messages);

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getSent(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    const messages = await getMessages(user.sentPrivateMessages);
    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  compose,
  inbox,
  getSent,
};

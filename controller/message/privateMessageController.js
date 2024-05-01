const Message = require("../../models/messageModel");
const User = require("../../models/userModel");
const Subreddit = require("../../models/subredditModel");

async function compose(req, res) {
  try {
    const subject = req.body.subject;
    const message = req.body.message;
    let sender = await User.findById(req.user.userId);
    if (req.body.subreddit) {
      sender = await Subreddit.findOne({ name: req.body.subreddit });
      let user = await User.findById(req.user.userId);
      if (!sender.moderators.some((mod) => mod.username === user.username)) {
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
    if (req.body.sendToSubreddit) {
      const subreddit = await Subreddit.findOne({ name: req.body.recipient });
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

    //save alll parallel
    await Promise.all([sentMessage.save(), sender.save(), recipient.save()]);

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
      .populate({ path: "recipient", select: "username" });

    return messages.map((message) => {
      return {
        id: message._id,
        sender: message.sender ? message.sender.username : null, // Check if sender is defined
        recipient: message.recipient ? message.recipient.username : null, // Check if recipient is defined
        subject: message.subject,
        message: message.message,
        timestamp: message.timestamp,
        isRead: message.isRead,
        isSent: message.isSent,
        isPrivate: message.isPrivate,
      };
    });
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
      case "UsernameMentions":
        messages = user.mentions;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid type",
        });
    }

    messages = await getMessages(messages);
    messages.sort((a, b) => b.timestamp - a.timestamp);

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
};

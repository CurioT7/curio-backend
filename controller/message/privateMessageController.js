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
      sender: senderSubreddit ? null : sender,
      type: "message",
      senderSubreddit: senderSubreddit && senderSubreddit,
      recipientSubreddit: subreddit && subreddit,
      recipient,
      subject,
      message,
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

async function inbox(req, res) {
  try {
    const type = req.params.type;
    const user = await User.findById(req.user.userId);
    let messages = [];
    switch (type) {
      case "all":
        messages = await Message.find({
          recipient: user,
          e,
        }).sort({ timestamp: -1 });
        break;
      case "unread":
        messages = await Message.find({
          recipient: user,
          isRead: false,
          e,
        }).sort({ timestamp: -1 });
        break;
      case "messages":
        messages = await Message.find({
          recipient: user,
          type: "message",
        }).sort({ timestamp: -1 });
        break;
      case "postReply":
        messages = await Message.find({
          recipient: user,
          type: "postReply",
        }).sort({ timestamp: -1 });
        break;
      case "usernameMentions":
        messages = await Message.find({
          recipient: user,
          type: "userMention",
        }).sort({ timestamp: -1 });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid type",
        });
    }

    //populate messages
    messages = await Message.populate(messages, [
      { path: "sender", select: "username" },
      { path: "recipient", select: "username" },
      { path: "recipientSubreddit", select: "name" },
      { path: "senderSubreddit", select: "name" },
      { path: "linkedSubreddit", select: "name" },
      { path: "postId", select: "title" },
    ]);

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
    const messages = await Message.find({
      sender: user,
    })
      .populate({ path: "sender", select: "username" })
      .populate({ path: "recipient", select: "username" })
      .populate({ path: "recipientSubreddit", select: "name" })
      .populate({ path: "senderSubreddit", select: "name" })
      .populate({ path: "linkedSubreddit", select: "name" })
      .sort({ timestamp: -1 });

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

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
      console.log(recipient.length);
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
        console.log(recipient);
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

module.exports = {
  compose,
};

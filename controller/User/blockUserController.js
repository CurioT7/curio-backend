require("dotenv").config();
const User = require("../../models/user");
const block = require('../../models/block');


async function blockUser(req, res) {
  const {usernameToBlock} = req.body;

  try {
    const blockingUser = await User.findOne({ username: usernameToBlock });    
    if (!blockingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const blockedUser = await User.findOne({ username: usernameToBlock });    
    if (!blockedUser) {
        return res.status(404).json({ message: 'User to block not found' });
      }  

    const existingBlock = await block.findOne({ blockerId: blockingUser._id, blockedId: blockedUser._id });
    if (existingBlock) {
        return res.status(409).json({ message: 'User already blocked' });
      }
    
    const newBlock = new block({ blockerId: blockingUser._id, blockedId: blockedUser._id });
    await newBlock.save();

    res.json({ message: 'User successfully blocked' });

    
    }
    catch (error) {
         return res.status(500).json({ 
            success: false,
            message: error.message
         });
     }

    
};


module.exports = { blockUser };
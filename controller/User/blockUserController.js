/**
 * @file This file contains controller functions related to user actions.
 * @module user/blockUserController
 */

const User = require("../../models/user");
const block = require('../../models/block');
require("dotenv").config();


/**
 * @description Blocks a user based on the provided username to block.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
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
        const lastUnblockTimestamp = existingBlock.unblockTimestamp || 0; // Get last unblock time (0 if never unblocked)
        const timeSinceUnblock = Date.now() - lastUnblockTimestamp;
        const cooldownTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
        if (timeSinceUnblock < cooldownTime) {
          return res.status(403).json({ message: 'You can\'t block the user for 24 hours after unblocking them' });
        }

        await existingBlock.save();
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
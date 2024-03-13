const mongoose = require("mongoose");



const blockSchema = new mongoose.Schema({
    blockerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User' 
    },
    blockedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User' 
    }
});

//  a unique compound index on blockerId and blockedId to enforce unique blocking relationships
blockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });

const block = mongoose.model("block", blockSchema);
module.exports = block;

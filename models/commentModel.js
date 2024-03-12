const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//create user schema for reddit user
const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    upvotes: {
        type: Number,
        default: 0,
    },
    downvotes: {
        type: Number,
        default: 0,
    },
    linkedPost: {
        type: Schema.Types.ObjectId,
        ref: "Post",
    },
});
const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
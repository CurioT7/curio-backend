const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const communitySettingsSchema = new Schema({
    communityName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    privacyMode: {
        type: String,
        enum: ["private", "public", "restricted"],
    },
    isNSFW: {
        type: Boolean,
        default: false,
    },
    isSpoiler: {
        type: Boolean,
        default: false,
    },
    mods: {
        type: [Schema.Types.ObjectId],
        ref: "User",
    },
    posts: {
        type: String,
        enum: ["Any", "Links Only","Text Posts Only"],
    },
    allowsCrossposting: {
        type: Boolean,
        default: True,
    },
    Archiveposts:{
        type: Boolean,
        default: False,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    banner: {
        type: String,
    },
    avatar: {
        type: String,
    },
 
    });


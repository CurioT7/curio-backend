const { verifyToken, authorizeUser } = require("../utils/tokens");
// const CommunitySettings = require("../models/communitySettingsModel");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const Subreddit = require("../models/subredditModel");
const Comment = require("../models/commentModel");
const { decode } = require("jsonwebtoken");
const mongoose = require("mongoose");
const { getFilesFromS3, sendFileToS3 } = require("../utils/s3-bucket");

const {
  communitySettings,
  updateCommunitySettings,
  mineWhere,
  bannerAndAvatar,
  editedQueues,
} = require("../controller/community/modToolsController");
const { describe } = require("node:test");
const mockFunction = jest.fn();
jest.mock("../utils/tokens");

describe("Community Settings", () => {
  // Returns the community settings of a subreddit when the user is authenticated, the subreddit exists, and the user is a moderator of the subreddit.
  it("should return the community settings of a subreddit when the user is authenticated, the subreddit exists, and the user is a moderator of the subreddit", async () => {
    const req = {
      user: {
        userId: "user123",
      },
      params: {
        subreddit: "subreddit1",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const User = require("../models/userModel");
    const Subreddit = require("../models/subredditModel");
    const CommunitySettings = require("../models/CommunitySettingsModel");
    const communitySettingsController = require("../controller/community/modToolsController");

    User.findOne = jest
      .fn()
      .mockResolvedValue({ _id: "user123", username: "moderator1" });
    Subreddit.findOne = jest.fn().mockResolvedValue({
      name: "subreddit1",
      moderators: [{ username: "moderator1" }],
    });
    CommunitySettings.findOne = jest
      .fn()
      .mockResolvedValue({ name: "subreddit1", description: "description1" });

    await communitySettingsController.communitySettings(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "user123" });
    expect(Subreddit.findOne).toHaveBeenCalledWith({ name: "subreddit1" });
    expect(CommunitySettings.findOne).toHaveBeenCalledWith({
      name: "subreddit1",
    });
    expect(res.json).toHaveBeenCalledWith({
      name: "subreddit1",
      description: "description1",
    });
  });

  // Returns 403 error when user is not authorized to update the settings of the subreddit.
  it("should return 403 error when user is not authorized to update the settings of the subreddit", async () => {
    const req = {
      user: {
        userId: "user123",
      },
      params: {
        subreddit: "subreddit1",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const User = require("../models/userModel");
    const Subreddit = require("../models/subredditModel");
    const CommunitySettings = require("../models/CommunitySettingsModel");
    const communitySettingsController = require("../controller/community/modToolsController");

    User.findOne = jest.fn().mockResolvedValue({ username: "user1" });
    Subreddit.findOne = jest.fn().mockResolvedValue({
      name: "subreddit1",
      moderators: [{ username: "moderator1" }],
    });

    await communitySettingsController.communitySettings(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "user123" });
    expect(Subreddit.findOne).toHaveBeenCalledWith({ name: "subreddit1" });
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "You are not authorized to update the settings of this subreddit",
    });
  });
  // Returns 404 error when subreddit is not found.
  it("should return 404 error when subreddit is not found", async () => {
    const req = {
      user: {
        userId: "user123",
      },
      params: {
        subreddit: "subreddit1",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const User = require("../models/userModel");
    const Subreddit = require("../models/subredditModel");
    const CommunitySettings = require("../models/CommunitySettingsModel");
    const communitySettingsController = require("../controller/community/modToolsController");

    User.findOne = jest.fn().mockResolvedValue({ username: "moderator1" });
    Subreddit.findOne = jest.fn().mockResolvedValue(null);

    await communitySettingsController.communitySettings(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "user123" });
    expect(Subreddit.findOne).toHaveBeenCalledWith({ name: "subreddit1" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });
});

describe("banner and icon", () => {
  // User not found
  it('should return 404 status with message "User not found"', async () => {
    const req = {
      user: {
        userId: "user_id",
      },
      params: {
        subreddit: "subreddit_name",
      },
      file: "image_file",
      body: {
        icon: "Update",
        banner: "Add",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const User = require("../models/userModel");
    const Subreddit = require("../models/subredditModel");
    const { sendFileToS3, getFilesFromS3 } = require("../utils/s3-bucket");

    User.findOne = jest.fn().mockResolvedValue(null);

    await bannerAndAvatar(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "user_id" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });
});

describe("updateCommunitySettings", () => {
  // Return 404 if user is not found
  it("should return 404 if user is not found", async () => {
    const req = {
      user: {
        userId: "user123",
      },
      params: {
        subreddit: "subreddit1",
      },
      body: {
        name: "newName",
        description: "newDescription",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const User = require("../models/userModel");
    const Subreddit = require("../models/subredditModel");
    const CommunitySettings = require("../models/CommunitySettingsModel");

    User.findOne = jest.fn().mockResolvedValue(null);

    await updateCommunitySettings(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "user123" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });
  // Return 404 if subreddit is not found
  it("should return 404 if subreddit is not found", async () => {
    const req = {
      user: {
        userId: "user123",
      },
      params: {
        subreddit: "subreddit1",
      },
      body: {
        name: "newName",
        description: "newDescription",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const User = require("../models/userModel");
    const Subreddit = require("../models/subredditModel");
    const CommunitySettings = require("../models/CommunitySettingsModel");

    User.findOne = jest.fn().mockResolvedValue({ _id: "user123" });
    Subreddit.findOne = jest.fn().mockResolvedValue(null);

    await updateCommunitySettings(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "user123" });
    expect(Subreddit.findOne).toHaveBeenCalledWith({ name: "subreddit1" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });
  // Successfully update community settings with community settings fields
  it("should successfully update community settings with community settings fields", async () => {
    const req = {
      user: {
        userId: "user123",
      },
      params: {
        subreddit: "subreddit1",
      },
      body: {
        name: "newName",
        description: "newDescription",
        welcomeMessage: "newWelcomeMessage",
        privacyMode: "newPrivacyMode",
        isNSFW: true,
        posts: "newPosts",
        isSpoiler: true,
        allowsCrossposting: true,
        archivePosts: true,
        allowImages: true,
        allowMultipleImages: true,
        allowPolls: true,
        postSpamFilterStrength: "newPostSpamFilterStrength",
        commentSpamFilterStrength: "newCommentSpamFilterStrength",
        linksSpamFilterStrength: "newLinksSpamFilterStrength",
        commentsSort: "newCommentsSort",
        collapseDeletedComments: true,
        commentScoreHide: true,
        allowGifComment: true,
        allowImageComment: true,
        allowCollectibleExpressions: true,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const User = require("../models/userModel");
    const Subreddit = require("../models/subredditModel");
    const CommunitySettings = require("../models/CommunitySettingsModel");

    User.findOne = jest
      .fn()
      .mockResolvedValue({ _id: "user123", username: "user123" });
    Subreddit.findOne = jest.fn().mockResolvedValue({
      name: "subreddit1",
      moderators: [{ username: "user123" }],
    });
    CommunitySettings.findOne = jest
      .fn()
      .mockResolvedValue({ name: "subreddit1" });
    Subreddit.updateOne = jest.fn().mockResolvedValue();
    CommunitySettings.findOneAndUpdate = jest
      .fn()
      .mockResolvedValue({ name: "subreddit1" });

    await updateCommunitySettings(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "user123" });
    expect(Subreddit.findOne).toHaveBeenCalledWith({ name: "subreddit1" });
    expect(CommunitySettings.findOne).toHaveBeenCalledWith({
      name: "subreddit1",
    });
    expect(Subreddit.updateOne).toHaveBeenCalledWith(
      { name: "subreddit1" },
      { name: "newName", description: "newDescription" }
    );
    expect(CommunitySettings.findOneAndUpdate).toHaveBeenCalledWith(
      { name: "subreddit1" },
      {
        name: "newName",
        description: "newDescription",
        welcomeMessage: "newWelcomeMessage",
        privacyMode: "newPrivacyMode",
        isNSFW: true,
        posts: "newPosts",
        isSpoiler: true,
        allowsCrossposting: true,
        archivePosts: true,
        allowImages: true,
        allowMultipleImages: true,
        allowPolls: true,
        postSpamFilterStrength: "newPostSpamFilterStrength",
        commentSpamFilterStrength: "newCommentSpamFilterStrength",
        linksSpamFilterStrength: "newLinksSpamFilterStrength",
        commentsSort: "newCommentsSort",
        collapseDeletedComments: true,
        commentScoreHide: true,
        allowGifComment: true,
        allowImageComment: true,
        allowCollectibleExpressions: true,
      },
      { new: true, upsert: true }
    );
    expect(res.json).toHaveBeenCalledWith({
      communitySettings: { name: "subreddit1" },
      message: "Community settings updated successfully",
    });
  });
  // Successfully update community settings with both common and community settings fields
  it("should successfully update community settings with common and community settings fields", async () => {
    const req = {
      user: {
        userId: "user123",
      },
      params: {
        subreddit: "subreddit1",
      },
      body: {
        name: "newName",
        description: "newDescription",
        welcomeMessage: "newWelcomeMessage",
        privacyMode: "newPrivacyMode",
        isNSFW: true,
        posts: "newPosts",
        isSpoiler: true,
        allowsCrossposting: true,
        archivePosts: true,
        allowImages: true,
        allowMultipleImages: true,
        allowPolls: true,
        postSpamFilterStrength: "newPostSpamFilterStrength",
        commentSpamFilterStrength: "newCommentSpamFilterStrength",
        linksSpamFilterStrength: "newLinksSpamFilterStrength",
        commentsSort: "newCommentsSort",
        collapseDeletedComments: true,
        commentScoreHide: true,
        allowGifComment: true,
        allowImageComment: true,
        allowCollectibleExpressions: true,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const User = require("../models/userModel");
    const Subreddit = require("../models/subredditModel");
    const CommunitySettings = require("../models/CommunitySettingsModel");

    User.findOne = jest
      .fn()
      .mockResolvedValue({ _id: "user123", username: "user123" });
    Subreddit.findOne = jest.fn().mockResolvedValue({
      name: "subreddit1",
      moderators: [{ username: "user123" }],
    });
    CommunitySettings.findOne = jest
      .fn()
      .mockResolvedValue({ name: "subreddit1" });
    Subreddit.updateOne = jest.fn().mockResolvedValue();
    CommunitySettings.findOneAndUpdate = jest
      .fn()
      .mockResolvedValue({ name: "subreddit1" });

    await updateCommunitySettings(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "user123" });
    expect(Subreddit.findOne).toHaveBeenCalledWith({ name: "subreddit1" });
    expect(CommunitySettings.findOne).toHaveBeenCalledWith({
      name: "subreddit1",
    });
    expect(Subreddit.updateOne).toHaveBeenCalledWith(
      { name: "subreddit1" },
      { name: "newName", description: "newDescription" }
    );
    expect(CommunitySettings.findOneAndUpdate).toHaveBeenCalledWith(
      { name: "subreddit1" },
      {
        name: "newName",
        description: "newDescription",
        welcomeMessage: "newWelcomeMessage",
        privacyMode: "newPrivacyMode",
        isNSFW: true,
        posts: "newPosts",
        isSpoiler: true,
        allowsCrossposting: true,
        archivePosts: true,
        allowImages: true,
        allowMultipleImages: true,
        allowPolls: true,
        postSpamFilterStrength: "newPostSpamFilterStrength",
        commentSpamFilterStrength: "newCommentSpamFilterStrength",
        linksSpamFilterStrength: "newLinksSpamFilterStrength",
        commentsSort: "newCommentsSort",
        collapseDeletedComments: true,
        commentScoreHide: true,
        allowGifComment: true,
        allowImageComment: true,
        allowCollectibleExpressions: true,
      },
      { new: true, upsert: true }
    );
    expect(res.json).toHaveBeenCalledWith({
      communitySettings: { name: "subreddit1" },
      message: "Community settings updated successfully",
    });
  });
});

describe("edited queue", () => {
  // Returns edited queues of a subreddit when all parameters are valid and user is authorized
  it("should return edited queues of a subreddit when all parameters are valid and user is authorized", async () => {
    const req = {
      user: {
        userId: "user123",
      },
      params: {
        subreddit: "subreddit1",
        type: "all",
        sort: "new",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      username: "user1",
    };
    const subreddit = {
      _id: "subreddit123",
      moderators: [{ username: "user1" }, { username: "user2" }],
    };
    const posts = [
      { createdAt: new Date("2022-01-01"), isEdited: true },
      { createdAt: new Date("2022-01-02"), isEdited: true },
    ];
    const comments = [
      { createdAt: new Date("2022-01-01"), isEdited: true },
      { createdAt: new Date("2022-01-02"), isEdited: true },
    ];

    User.findOne = jest.fn().mockResolvedValue(user);
    Subreddit.findOne = jest.fn().mockResolvedValue(subreddit);
    Post.find = jest.fn().mockResolvedValue(posts);
    Comment.find = jest.fn().mockResolvedValue(comments);

    await editedQueues(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "user123" });
    expect(Subreddit.findOne).toHaveBeenCalledWith({ name: "subreddit1" });
    expect(Post.find).toHaveBeenCalledWith({
      linkedSubreddit: "subreddit123",
      isEdited: true,
    });
    expect(Comment.find).toHaveBeenCalledWith({
      linkedSubreddit: "subreddit123",
      isEdited: true,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { posts, comments },
    });
  });
  // Returns 404 error when user is not found
  it("should return 404 error when user is not found", async () => {
    const req = {
      user: {
        userId: "user123",
      },
      params: {
        subreddit: "subreddit1",
        type: "all",
        sort: "new",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findOne = jest.fn().mockResolvedValue(null);

    await editedQueues(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "user123" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  // Returns edited queues of a subreddit when type is 'all' and sort is 'new'
  it("should return edited queues of a subreddit when all parameters are valid and user is authorized", async () => {
    const req = {
      user: {
        userId: "user123",
      },
      params: {
        subreddit: "subreddit1",
        type: "all",
        sort: "new",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      username: "user1",
    };
    const subreddit = {
      _id: "subreddit123",
      moderators: [{ username: "user1" }, { username: "user2" }],
    };
    const posts = [
      { createdAt: new Date("2022-01-01"), isEdited: true },
      { createdAt: new Date("2022-01-02"), isEdited: true },
    ];
    const comments = [
      { createdAt: new Date("2022-01-01"), isEdited: true },
      { createdAt: new Date("2022-01-02"), isEdited: true },
    ];

    User.findOne = jest.fn().mockResolvedValue(user);
    Subreddit.findOne = jest.fn().mockResolvedValue(subreddit);
    Post.find = jest.fn().mockResolvedValue(posts);
    Comment.find = jest.fn().mockResolvedValue(comments);

    await editedQueues(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "user123" });
    expect(Subreddit.findOne).toHaveBeenCalledWith({ name: "subreddit1" });
    expect(Post.find).toHaveBeenCalledWith({
      linkedSubreddit: "subreddit123",
      isEdited: true,
    });
    expect(Comment.find).toHaveBeenCalledWith({
      linkedSubreddit: "subreddit123",
      isEdited: true,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { posts, comments },
    });
  });
  // Returns edited queues of a subreddit when type is 'post' and sort is 'new'
  it('should return edited queues of a subreddit when type is "post" and sort is "new"', async () => {
    const req = {
      user: {
        userId: "user123",
      },
      params: {
        subreddit: "subreddit1",
        type: "post",
        sort: "new",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      username: "user1",
    };
    const subreddit = {
      _id: "subreddit123",
      moderators: [{ username: "user1" }, { username: "user2" }],
    };
    const posts = [
      { createdAt: new Date("2022-01-01"), isEdited: true },
      { createdAt: new Date("2022-01-02"), isEdited: true },
    ];

    User.findOne = jest.fn().mockResolvedValue(user);
    Subreddit.findOne = jest.fn().mockResolvedValue(subreddit);
    Post.find = jest.fn().mockResolvedValue(posts);

    await editedQueues(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "user123" });
    expect(Subreddit.findOne).toHaveBeenCalledWith({ name: "subreddit1" });
    expect(Post.find).toHaveBeenCalledWith({
      linkedSubreddit: "subreddit123",
      isEdited: true,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { posts } });
  });
});

describe("mine where", () => {
  // Returns 404 if the user is not found.
  it("should return 404 if the user is not found", async () => {
    const req = { user: { userId: "user123" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findOne = jest.fn().mockResolvedValue(null);

    await mineWhere(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "user123" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });
});


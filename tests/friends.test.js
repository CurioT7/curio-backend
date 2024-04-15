// Import dependencies and modules
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/userModel");
const Community = require("../models/subredditModel");
const {
  followSubreddit,
  unFollowSubreddit,
  addFriend,
  deleteFriend,
  addUserToSubbreddit,
  friendRequest,
  unFriendRequest,
  getUserInfo,
} = require("../controller/friends/friendController");
const { verifyToken } = require("../utils/tokens");

// Mock the verifyToken function
jest.mock("../utils/tokens");

describe("followSubreddit function", () => {
  it("should follow a subreddit successfully when given valid username and communityName", async () => {
    const req = {
      body: {
        subreddit: "testSubreddit",
      },
      headers: {
        authorization: "Bearer token",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const decodedToken = { userId: "testUserId" };

    // Mocking the verifyToken function
    verifyToken.mockResolvedValueOnce(decodedToken);

    // Mocking the User.findOne function
    User.findOne = jest
      .fn()
      .mockResolvedValueOnce({ username: "testUsername" });

    // Mocking the Community.findOne function
    Community.findOne = jest
      .fn()
      .mockResolvedValueOnce({ name: "testSubreddit" });

    // Mocking the followSubreddits function
    const followSubreddits = jest.fn();
    followSubreddits.mockResolvedValueOnce(true);

    // Executing the function
    await followSubreddit(req, res);

    // Assertions
    expect(verifyToken).toHaveBeenCalledWith("token");
    expect(User.findOne).toHaveBeenCalledWith({ _id: "testUserId" });
    expect(Community.findOne).toHaveBeenCalledWith({ name: "testSubreddit" });
    expect(followSubreddits).toHaveBeenCalledWith(
      "testUsername",
      "testSubreddit"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Subreddit followed successfully",
    });
  });
});
describe("unFollowSubreddit function", () => {
  it("should return a 500 status code if the token is missing or invalid", async () => {
    const req = {
      headers: {
        authorization: "Bearer invalidToken",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await unFollowSubreddit(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "Cannot destructure property 'subreddit' of 'req.body' as it is undefined.",
      success: false,
    });
  });
});

describe("addFriend function", () => {
  it("should add a friend to a user's followings and the user to the friend's followers", async () => {
    const user = { username: "user1" };
    const friend = "friend1";

    User.findOneAndUpdate = jest.fn();

    await addFriend(user.username, friend);

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { username: user.username },
      {
        $addToSet: {
          followings: friend,
        },
      }
    );
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { username: friend },
      {
        $addToSet: {
          followers: user.username,
        },
      }
    );
  });
});

describe("deleteFriend function", () => {
  it("should delete friend from user's followings list", async () => {
    const username = "user1";
    const friend = "friend1";
    const user = {
      username: username,
      followings: [friend],
    };
    const friendUser = {
      username: friend,
      followers: [username],
    };
    const findOneAndUpdateMock = jest.fn();
    User.findOneAndUpdate = findOneAndUpdateMock
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(friendUser);

    await deleteFriend(username, friend);

    expect(findOneAndUpdateMock).toHaveBeenCalledTimes(2);
    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { username: username },
      {
        $pull: {
          followings: friend,
        },
      }
    );
    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { username: friend },
      {
        $pull: {
          followers: username,
        },
      }
    );
  });
});

describe("addUserToSubbreddit function", () => {
  it("should add user to subreddit when function is called", async () => {
    const user = {
      username: "testUser",
      moderators: [],
      member: [],
    };
    const communityName = "testCommunity";
    const userModerator = {
      communityName: communityName,
      role: "creator",
    };
    const userMember = {
      communityName: communityName,
    };
    const moderator = user.moderators || [];
    moderator.push(userModerator);
    const members = user.member || [];
    members.push(userMember);

    const findOneAndUpdateMock = jest.fn();
    const userMock = {
      findOneAndUpdate: findOneAndUpdateMock,
    };
    await addUserToSubbreddit(userMock, communityName);

    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { username: user.username },
      { moderators: moderator, member: members }
    );
  });
});

describe("friendRequest function", () => {
  it("should return 401 if token is invalid", async () => {
    const req = {
      headers: {
        authorization: "Bearer invalidToken",
      },
      body: {
        friendUsername: "friend",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await friendRequest(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });
});

describe("unFriendRequest function", () => {
  it("should return a 401 status code if the token is missing or invalid", async () => {
    const req = {
      headers: {
        authorization: "Bearer invalidToken",
      },
      body: {
        friendUsername: "friend",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await unFriendRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });
});




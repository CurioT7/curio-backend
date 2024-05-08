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

jest.mock("../utils/tokens");


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






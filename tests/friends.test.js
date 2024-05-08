// Import dependencies and modules
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/userModel");
const Community = require("../models/subredditModel");
const {
  getUserInfo,
  followSubreddit,
  unFollowSubreddit,
  addFriend,
  deleteFriend,
  getFollowersOrFollowings,
} = require("../controller/friends/friendController");
const { verifyToken } = require("../utils/tokens");
jest.mock("../models/subredditModel");
jest.mock("../models/userModel");
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



describe("followSubreddit function", () => {
  it("should return a 404 status code with an error message if user is not found", async () => {
    const req = {
      user: {
        userId: "nonExistentUserId",
      },
      body: {
        subreddit: "testsubreddit",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue(null); // Simulating user not found

    await followSubreddit(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });

  it("should return a 404 status code with an error message if subreddit is not found", async () => {
    const req = {
      user: {
        userId: "testuserid",
      },
      body: {
        subreddit: "nonExistentSubreddit",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue({}); // Simulating user found
    Community.findOne.mockResolvedValue(null); // Simulating subreddit not found

    await followSubreddit(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Subreddit not found",
    });
  });

});

describe("unFollowSubreddit function", () => {
  it("should return a 404 status code with an error message if user is not found", async () => {
    const req = {
      user: {
        userId: "nonExistentUserId",
      },
      body: {
        subreddit: "testsubreddit",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue(null); // Simulating user not found

    await unFollowSubreddit(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Username not found",
    });
  });

  it("should return a 404 status code with an error message if subreddit is not found", async () => {
    const req = {
      user: {
        userId: "testuserid",
      },
      body: {
        subreddit: "nonExistentSubreddit",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue({}); // Simulating user found
    Community.findOne.mockResolvedValue(null); // Simulating subreddit not found

    await unFollowSubreddit(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Subreddit not found",
    });
  });

});
describe("getUserInfo function", () => {
  it("should return a 404 status code with an error message if user is not found", async () => {
    const req = {
      user: {
        userId: "nonExistentUserId",
      },
      params: {
        friendUsername: "testfriend",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue(null);

    await getUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });
  // Retrieve user information for a valid friend username that exists in the user's friend list
  it("should return user information when a valid friend username is provided", async () => {
    const req = {
      params: {
        friendUsername: "validFriendUsername",
      },
      user: {
        userId: "validUserId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const friend = {
      username: "validFriendUsername",
      bio: "validFriendBio",
      profilePicture: "validFriendProfilePicture",
      media: "validFriendMedia",
    };
    User.findById = jest
      .fn()
      .mockResolvedValueOnce({ followings: ["validFriendUsername"] });
    User.findOne = jest.fn().mockResolvedValueOnce(friend);
    await getUserInfo(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      username: friend.username,
      bio: friend.bio,
      profilePicture: friend.profilePicture,
      media: {},
    });
  });
});

describe("unFollowSubreddits function", () => {
 
});
describe("followSubreddit function", () => {
  it("should return a 404 status code with an error message if user is not found", async () => {
    const req = {
      body: {
        subreddit: "testsubreddit",
      },
      user: {
        userId: "nonExistentUserId",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Simulating user not found
    User.findById.mockResolvedValue(null);

    await followSubreddit(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });

  it("should return a 404 status code with an error message if subreddit is not found", async () => {
    const req = {
      body: {
        subreddit: "nonExistentSubreddit",
      },
      user: {
        userId: "testUserId",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Simulating user found
    User.findById.mockResolvedValue({});

    // Simulating subreddit not found
    Community.findOne.mockResolvedValue(null);

    await followSubreddit(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Subreddit not found",
    });
  });

});
  
describe("getFollowersOrFollowings function", () => {
  it("should return a list of followers with profile pictures", async () => {
    // Mocking request and response objects
    const req = {
      user: {
        userId: "testUserId",
      },
      params: {
        friends: "followers",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mocking user data
    const user = {
      _id: "testUserId",
      followers: ["follower1", "follower2"],
    };

    // Mocking User.findById to resolve with user data
    User.findById.mockResolvedValue(user);

    // Mocking user data with profile pictures
    const usersWithProfilePictures = [
      { username: "follower1", profilePicture: "profile1.jpg" },
      { username: "follower2", profilePicture: "profile2.jpg" },
    ];

    // Mocking User.aggregate to resolve with users with profile pictures
    User.aggregate.mockResolvedValue(usersWithProfilePictures);

    // Calling the function
    await getFollowersOrFollowings(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      friendsArray: usersWithProfilePictures,
    });
  });

  // Add more test cases for followings, and error scenarios if needed
});
